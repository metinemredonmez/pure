import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { OrderStatus } from '@prisma/client';

/**
 * Ödenmemiş (PENDING) siparişler için:
 *  - Gün-aşırı 1 adet "Sepetinizde ürünler bekliyor" hatırlatma maili (en çok 3 kez).
 *  - Çok eski (5 gün) ödenmemiş siparişleri iptal edip stoğu geri yükler
 *    (tekrar tekrar denenen ödemelerden kalan stok kilidini serbest bırakır).
 *
 * Sepet localStorage'da tutulduğu için "terk edilmiş sepet" pratikte, müşterinin
 * "Siparişi Onayla" deyip PayTR'de ödemeyi tamamlamadığı PENDING siparişidir —
 * bu siparişte müşteri e-postası ve ürünler mevcuttur.
 */
@Injectable()
export class AbandonedOrderService {
  private readonly logger = new Logger(AbandonedOrderService.name);

  private readonly REMIND_AFTER_HOURS = 24; // İlk hatırlatma için bekleme
  private readonly REMIND_EVERY_HOURS = 40; // ~gün aşırı (günlük cron'a pay)
  private readonly MAX_REMINDERS = 3;
  private readonly CANCEL_AFTER_DAYS = 5;

  constructor(
    private prisma: PrismaService,
    private notification: NotificationService,
    private config: ConfigService,
  ) {}

  // Her gün 10:00 — ödenmemiş sipariş hatırlatması
  @Cron('0 10 * * *', { name: 'unpaid-order-reminder' })
  async remindUnpaidOrders() {
    const now = new Date();
    const createdBefore = new Date(now.getTime() - this.REMIND_AFTER_HOURS * 3600_000);
    const remindableBefore = new Date(now.getTime() - this.REMIND_EVERY_HOURS * 3600_000);

    let orders: any[] = [];
    try {
      orders = await this.prisma.order.findMany({
        where: {
          status: OrderStatus.PENDING,
          createdAt: { lte: createdBefore },
          reminderCount: { lt: this.MAX_REMINDERS },
          OR: [{ lastReminderAt: null }, { lastReminderAt: { lte: remindableBefore } }],
        },
        include: { user: true, items: true },
        take: 100,
        orderBy: { createdAt: 'asc' },
      });
    } catch (e) {
      this.logger.error(`Ödenmemiş sipariş sorgusu başarısız: ${String(e)}`);
      return;
    }

    let sent = 0;
    for (const order of orders) {
      const email = order.user?.email;
      if (!email) continue;
      try {
        await this.notification.sendEmail(
          email,
          'Sepetinizdeki ürünler sizi bekliyor ☕',
          this.buildReminderHtml(order),
        );
        await this.prisma.order.update({
          where: { id: order.id },
          data: { reminderCount: { increment: 1 }, lastReminderAt: now },
        });
        sent++;
      } catch (e) {
        this.logger.error(`Hatırlatma maili başarısız (${order.orderNumber}): ${String(e)}`);
      }
    }
    if (sent > 0) this.logger.log(`Ödenmemiş sipariş hatırlatması: ${sent} mail gönderildi`);

    await this.cancelStaleOrders(now);
  }

  // Çok eski ödenmemiş siparişleri iptal et + stok iadesi
  private async cancelStaleOrders(now: Date) {
    const cancelBefore = new Date(now.getTime() - this.CANCEL_AFTER_DAYS * 86400_000);
    let stale: any[] = [];
    try {
      stale = await this.prisma.order.findMany({
        where: { status: OrderStatus.PENDING, createdAt: { lte: cancelBefore } },
        include: { items: true },
        take: 100,
      });
    } catch (e) {
      this.logger.error(`Eski sipariş sorgusu başarısız: ${String(e)}`);
      return;
    }

    let cancelled = 0;
    for (const order of stale) {
      try {
        await this.prisma.$transaction(async (tx) => {
          for (const item of order.items) {
            if (item.variantId) {
              await tx.productVariant.update({
                where: { id: item.variantId },
                data: { stock: { increment: item.quantity } },
              });
            } else if (item.productId) {
              await tx.product.update({
                where: { id: item.productId },
                data: { stock: { increment: item.quantity } },
              });
            }
          }
          await tx.order.update({
            where: { id: order.id },
            data: {
              status: OrderStatus.CANCELLED,
              statusHistory: {
                create: {
                  status: OrderStatus.CANCELLED,
                  note: 'Ödeme yapılmadığı için otomatik iptal edildi',
                },
              },
            },
          });
        });
        cancelled++;
      } catch (e) {
        this.logger.error(`Eski sipariş iptali başarısız (${order.orderNumber}): ${String(e)}`);
      }
    }
    if (cancelled > 0) this.logger.log(`Ödenmemiş eski sipariş iptali: ${cancelled} sipariş, stok iade edildi`);
  }

  private buildReminderHtml(order: any): string {
    const frontendUrl = this.config.get<string>('app.frontendUrl') || 'https://pureolentia.com';
    const rows = (order.items || [])
      .map(
        (it: any) =>
          `<tr><td style="padding:6px 0;color:#333">${it.productName || 'Ürün'}${
            it.variantName ? ` <span style="color:#888">(${it.variantName})</span>` : ''
          } × ${it.quantity}</td><td style="padding:6px 0;text-align:right;color:#333">₺${Number(
            it.totalPrice,
          ).toFixed(2)}</td></tr>`,
      )
      .join('');
    return `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;padding:24px">
      <h2 style="color:#D4793F;margin:0 0 8px">Sepetinizdeki ürünler sizi bekliyor</h2>
      <p style="color:#555;font-size:14px;line-height:1.6">
        Merhaba, tamamlanmamış bir siparişiniz var. Ürünleriniz sizin için ayrıldı;
        ödemeyi tamamlayarak siparişinizi kesinleştirebilirsiniz.
      </p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;margin:16px 0">
        ${rows}
        <tr><td style="padding:10px 0;border-top:1px solid #eee;font-weight:bold">Toplam</td>
        <td style="padding:10px 0;border-top:1px solid #eee;text-align:right;font-weight:bold">₺${Number(
          order.total,
        ).toFixed(2)}</td></tr>
      </table>
      <a href="${frontendUrl}/cart" style="display:inline-block;background:#D4793F;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:bold">Siparişi Tamamla</a>
      <p style="color:#999;font-size:12px;margin-top:20px">Sipariş No: ${order.orderNumber}</p>
    </div>`;
  }
}
