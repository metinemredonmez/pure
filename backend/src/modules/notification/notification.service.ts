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
  async sendEmail(
    to: string,
    subject: string,
    html: string,
    _templateName?: string,
  ) {
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
  async sendTemplatedEmail(
    to: string,
    templateName: string,
    variables: Record<string, string>,
  ) {
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
  async sendOrderConfirmation(
    email: string,
    orderNumber: string,
    total: string,
  ) {
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

  async sendSubscriptionRenewed(
    email: string,
    planName: string,
    nextDate: string,
  ) {
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

  // ============================================
  // IN-APP NOTIFICATIONS (Anlık iç bildirimler)
  // ============================================

  /**
   * Anlık bildirim gönder (panel içi)
   */
  async sendInApp(
    userId: string,
    title: string,
    message: string,
    type: string = 'info',
    link?: string,
    metadata?: any,
  ) {
    const notification = await this.prisma.inAppNotification.create({
      data: { userId, title, message, type, link, metadata },
    });

    this.logger.log(`In-app notification sent to ${userId}: ${title}`);
    // TODO: Phase 2 — WebSocket ile anlık push (Socket.IO)
    return notification;
  }

  /**
   * Kullanıcının bildirimlerini getir
   */
  async getUserNotifications(
    userId: string,
    page = 1,
    limit = 20,
    unreadOnly = false,
  ) {
    const where: any = { userId };
    if (unreadOnly) where.isRead = false;

    const [notifications, total, unreadCount] = await Promise.all([
      this.prisma.inAppNotification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.inAppNotification.count({ where }),
      this.prisma.inAppNotification.count({
        where: { userId, isRead: false },
      }),
    ]);

    return {
      data: notifications,
      unreadCount,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Bildirimi okundu olarak işaretle
   */
  async markAsRead(userId: string, notificationId: string) {
    return this.prisma.inAppNotification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true, readAt: new Date() },
    });
  }

  /**
   * Tüm bildirimleri okundu yap
   */
  async markAllAsRead(userId: string) {
    return this.prisma.inAppNotification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
  }

  // ── Event-based notification helpers ──

  async notifyOrderCreated(userId: string, orderNumber: string, total: string) {
    return this.sendInApp(
      userId,
      'Sipariş Oluşturuldu',
      `${orderNumber} numaralı siparişiniz alındı. Toplam: ₺${total}`,
      'order',
      `/orders/${orderNumber}`,
      { orderNumber, total },
    );
  }

  async notifyOrderShipped(
    userId: string,
    orderNumber: string,
    trackingUrl?: string,
  ) {
    return this.sendInApp(
      userId,
      'Sipariş Kargoda',
      `${orderNumber} numaralı siparişiniz kargoya verildi.`,
      'order',
      trackingUrl || `/orders/${orderNumber}`,
      { orderNumber },
    );
  }

  async notifyPaymentCompleted(userId: string, amount: string) {
    return this.sendInApp(
      userId,
      'Ödeme Başarılı',
      `₺${amount} tutarında ödemeniz başarıyla alındı.`,
      'payment',
    );
  }

  async notifyPaymentFailed(userId: string, reason?: string) {
    return this.sendInApp(
      userId,
      'Ödeme Başarısız',
      `Ödemeniz gerçekleştirilemedi.${reason ? ' Sebep: ' + reason : ''}`,
      'error',
      '/payment',
    );
  }

  async notifySubscriptionRenewed(userId: string, planName: string) {
    return this.sendInApp(
      userId,
      'Abonelik Yenilendi',
      `${planName} aboneliğiniz başarıyla yenilendi.`,
      'subscription',
      '/subscriptions',
    );
  }

  async notifyLowStock(adminId: string, productName: string, stock: number) {
    return this.sendInApp(
      adminId,
      'Stok Uyarısı',
      `${productName} stoku kritik seviyede: ${stock} adet kaldı.`,
      'warning',
      '/admin/products',
      { productName, stock },
    );
  }

  async notifyNewB2bLead(adminId: string, companyName: string) {
    return this.sendInApp(
      adminId,
      'Yeni B2B Lead',
      `${companyName} firmasından yeni kurumsal talep geldi.`,
      'info',
      '/admin/b2b/leads',
      { companyName },
    );
  }
}
