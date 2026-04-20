import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationService } from './notification.service';

export type BroadcastAudience = 'ALL' | 'CUSTOMERS' | 'SUBSCRIBERS' | 'MANUAL';
export type BroadcastChannel = 'EMAIL' | 'PUSH';

export interface BroadcastPayload {
  audience: BroadcastAudience;
  channel: BroadcastChannel;
  subject: string;
  body: string; // HTML for email, plain text for push
  manualEmails?: string[]; // only when audience === MANUAL
}

@Injectable()
export class BroadcastService {
  private readonly logger = new Logger(BroadcastService.name);

  constructor(
    private prisma: PrismaService,
    private notification: NotificationService,
    private config: ConfigService,
  ) {}

  /** Send a single push via OneSignal REST API to all subscribed users */
  private async sendOneSignalBroadcast(subject: string, body: string): Promise<{ id?: string; error?: string }> {
    const appId = this.config.get<string>('onesignal.appId') || process.env.ONESIGNAL_APP_ID;
    const apiKey = this.config.get<string>('onesignal.apiKey') || process.env.ONESIGNAL_API_KEY;

    if (!appId || !apiKey) {
      return { error: 'OneSignal credentials not configured (ONESIGNAL_APP_ID / ONESIGNAL_API_KEY)' };
    }

    try {
      const res = await fetch('https://onesignal.com/api/v1/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Key ${apiKey}`,
        },
        body: JSON.stringify({
          app_id: appId,
          included_segments: ['Total Subscriptions'],
          headings: { en: subject, tr: subject },
          contents: { en: body, tr: body },
        }),
      });
      const data: any = await res.json();
      if (!res.ok || data?.errors) {
        return { error: data?.errors?.[0] || data?.error || 'OneSignal API error' };
      }
      return { id: data?.id };
    } catch (e: any) {
      return { error: e?.message || 'OneSignal fetch failed' };
    }
  }

  /** Resolve target email list based on audience selection */
  private async resolveRecipients(payload: BroadcastPayload): Promise<{ email: string; id?: string }[]> {
    if (payload.audience === 'MANUAL') {
      const emails = (payload.manualEmails || [])
        .map((e) => (e || '').trim().toLowerCase())
        .filter((e) => e && /.+@.+\..+/.test(e));
      return [...new Set(emails)].map((email) => ({ email }));
    }

    const baseWhere: any = { isActive: true, email: { not: '' } };

    if (payload.audience === 'CUSTOMERS') {
      const users = await this.prisma.user.findMany({
        where: { ...baseWhere, orders: { some: {} } },
        select: { id: true, email: true },
      });
      return users.filter((u) => !!u.email).map((u) => ({ email: u.email, id: u.id }));
    }

    if (payload.audience === 'SUBSCRIBERS') {
      const users = await this.prisma.user.findMany({
        where: {
          ...baseWhere,
          subscriptions: { some: { status: { in: ['ACTIVE', 'PAST_DUE', 'PAUSED'] as any } } },
        },
        select: { id: true, email: true },
      });
      return users.filter((u) => !!u.email).map((u) => ({ email: u.email, id: u.id }));
    }

    // ALL
    const users = await this.prisma.user.findMany({
      where: baseWhere,
      select: { id: true, email: true },
    });
    return users.filter((u) => !!u.email).map((u) => ({ email: u.email, id: u.id }));
  }

  /** Estimate audience size (preview before sending) */
  async previewAudience(audience: BroadcastAudience, manualEmails?: string[]) {
    const recipients = await this.resolveRecipients({
      audience,
      channel: 'EMAIL',
      subject: '',
      body: '',
      manualEmails,
    });
    return { count: recipients.length, sample: recipients.slice(0, 5).map((r) => r.email) };
  }

  /** Send broadcast immediately (simple, blocking loop for now) */
  async send(payload: BroadcastPayload) {
    if (!payload.subject?.trim()) throw new BadRequestException('Konu zorunludur');
    if (!payload.body?.trim()) throw new BadRequestException('İçerik zorunludur');

    const recipients = await this.resolveRecipients(payload);
    if (recipients.length === 0) {
      throw new BadRequestException('Hedef kitlede hiç alıcı bulunamadı');
    }

    let sent = 0;
    let failed = 0;
    const errors: { email: string; error: string }[] = [];

    // PUSH: OneSignal sends one request to all subscribed users at once (no per-user loop)
    if (payload.channel === 'PUSH') {
      const result = await this.sendOneSignalBroadcast(payload.subject, payload.body);
      if (result.error) {
        failed = recipients.length;
        errors.push({ email: 'onesignal-broadcast', error: result.error });
        await this.prisma.sentNotification.create({
          data: { channel: 'push', recipient: 'all-subscribers', subject: payload.subject, body: payload.body, status: 'failed' },
        });
      } else {
        sent = recipients.length;
        await this.prisma.sentNotification.create({
          data: { channel: 'push', recipient: 'all-subscribers', subject: payload.subject, body: payload.body, status: 'sent' },
        });
      }
      return { audience: payload.audience, channel: payload.channel, totalRecipients: recipients.length, sent, failed, errors };
    }

    // EMAIL: per-recipient send
    for (const r of recipients) {
      try {
        await this.notification.sendEmail(r.email, payload.subject, payload.body);
        sent++;
      } catch (e: any) {
        failed++;
        errors.push({ email: r.email, error: e?.message || 'unknown' });
        this.logger.error(`Broadcast to ${r.email} failed: ${e?.message}`);
      }
    }

    return {
      audience: payload.audience,
      channel: payload.channel,
      totalRecipients: recipients.length,
      sent,
      failed,
      errors: errors.slice(0, 10),
    };
  }

  /** Recent broadcast history (reads SentNotification log grouped by subject + channel + time bucket) */
  async history(limit = 50) {
    const rows = await this.prisma.sentNotification.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return rows;
  }
}
