import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private transporter: nodemailer.Transporter;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get('smtp.host'),
      port: this.config.get('smtp.port'),
      secure: false, // true for 465, false for other ports
      auth: this.config.get('smtp.user')
        ? {
            user: this.config.get('smtp.user'),
            pass: this.config.get('smtp.pass'),
          }
        : undefined,
    });
  }

  // ── Send email ──
  async sendEmail(to: string, subject: string, html: string, templateName?: string) {
    try {
      const info = await this.transporter.sendMail({
        from: `"Olentia Pure" <${this.config.get('smtp.from')}>`,
        to,
        subject,
        html,
      });

      // Log sent notification
      await this.prisma.sentNotification.create({
        data: {
          channel: 'email',
          recipient: to,
          subject,
          body: html,
          status: 'sent',
          metadata: { messageId: info.messageId },
        },
      });

      this.logger.log(`Email sent to ${to}: ${subject}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${error.message}`);

      await this.prisma.sentNotification.create({
        data: {
          channel: 'email',
          recipient: to,
          subject,
          body: html,
          status: 'failed',
          metadata: { error: error.message },
        },
      });

      return { success: false, error: error.message };
    }
  }

  // ── Template-based email ──
  async sendTemplatedEmail(to: string, templateName: string, variables: Record<string, string>) {
    const template = await this.prisma.notificationTemplate.findUnique({
      where: { name: templateName },
    });

    if (!template || !template.isActive) {
      this.logger.warn(`Template ${templateName} not found or inactive`);
      return { success: false, error: 'Template not found' };
    }

    // Simple variable replacement
    let html = template.body;
    let subject = template.subject || '';
    for (const [key, value] of Object.entries(variables)) {
      html = html.replace(new RegExp(`{{${key}}}`, 'g'), value);
      subject = subject.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }

    return this.sendEmail(to, subject, html, templateName);
  }

  // ── Pre-built emails ──
  async sendOrderConfirmation(email: string, orderNumber: string, total: string) {
    return this.sendTemplatedEmail(email, 'order_confirmed', {
      orderNumber,
      total,
    });
  }

  async sendWelcomeEmail(email: string, firstName: string) {
    return this.sendTemplatedEmail(email, 'welcome', { firstName });
  }

  async sendPasswordReset(email: string, resetLink: string) {
    return this.sendTemplatedEmail(email, 'password_reset', { resetLink });
  }

  async sendSubscriptionRenewed(email: string, planName: string, nextDate: string) {
    return this.sendTemplatedEmail(email, 'subscription_renewed', {
      planName,
      nextDate,
    });
  }

  // ── Admin: manage templates ──
  async findAllTemplates() {
    return this.prisma.notificationTemplate.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async createTemplate(data: {
    name: string;
    channel: string;
    subject?: string;
    body: string;
  }) {
    return this.prisma.notificationTemplate.create({ data });
  }

  async updateTemplate(id: string, data: any) {
    return this.prisma.notificationTemplate.update({
      where: { id },
      data,
    });
  }

  // ── Admin: notification logs ──
  async findSentNotifications(limit = 50) {
    return this.prisma.sentNotification.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
