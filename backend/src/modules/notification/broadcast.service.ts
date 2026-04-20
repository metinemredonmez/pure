import { Injectable, Logger, BadRequestException } from '@nestjs/common';
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
  ) {}

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

    for (const r of recipients) {
      try {
        if (payload.channel === 'EMAIL') {
          await this.notification.sendEmail(r.email, payload.subject, payload.body);
          sent++;
        } else if (payload.channel === 'PUSH') {
          // Push channel placeholder — uses SentNotification log, actual OneSignal/FCM hook TBD
          await this.prisma.sentNotification.create({
            data: {
              channel: 'push',
              recipient: r.email,
              subject: payload.subject,
              body: payload.body,
              status: 'queued',
            },
          });
          sent++;
        }
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
