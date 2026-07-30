import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { KargonomiService } from './kargonomi.service';
import { OrderService } from '../order/order.service';
import { OrderStatus } from '@prisma/client';

/**
 * Sipariş ↔ Kargonomi köprüsü.
 *  - shipOrder: sipariş için Kargonomi gönderisi oluşturur (3 adım: create →
 *    fiyat karşılaştır → en ucuz firmayı onayla), takip no'yu siparişe yazar,
 *    durumu SHIPPED yapar (müşteriye kargo maili OrderService üzerinden gider).
 *  - handleWebhookEvent: Kargonomi shipment.updated webhook'unu siparişe eşler,
 *    durum/takip no günceller (teslimde "teslim edildi" maili otomatik).
 *
 * NOT: il/ilçe → state_id/city_id eşlemesi ve fiyat-karşılaştırma yanıt yapısı
 * dokümanda örneklenmemiştir; savunmacı okunur ve yanıtlar loglanır — canlı
 * token ile ilk gerçek gönderide alan adları doğrulanacaktır.
 */
@Injectable()
export class KargonomiOrderService {
  private readonly logger = new Logger(KargonomiOrderService.name);

  // Kargonomi gönderi durumu → sipariş durumu
  private readonly STATUS_MAP: Record<string, OrderStatus> = {
    webservice_shipment_started: OrderStatus.IN_TRANSIT,
    webservice_shipment_delivered: OrderStatus.DELIVERED,
    webservice_shipment_returning: OrderStatus.RETURNED,
    webservice_shipment_not_delivered: OrderStatus.IN_TRANSIT,
    cancelled: OrderStatus.CANCELLED,
  };

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private kargonomi: KargonomiService,
    private orderService: OrderService,
  ) {}

  private normalizePhone(raw?: string): string {
    let d = String(raw || '').replace(/\D/g, '');
    if (d.startsWith('90')) d = d.slice(2);
    if (d.length === 11 && d.startsWith('0')) d = d.slice(1);
    return d.slice(-10);
  }

  private pickCheapestProviderId(comparison: any): number | null {
    const list: any[] = Array.isArray(comparison)
      ? comparison
      : comparison?.data || comparison?.prices || comparison?.providers || [];
    if (!list.length) return null;
    const priceOf = (o: any) =>
      Number(o?.price ?? o?.amount ?? o?.total ?? o?.fiyat ?? Infinity);
    const idOf = (o: any) =>
      o?.shipping_provider_id ?? o?.provider_id ?? o?.id ?? null;
    const sorted = [...list].sort((a, b) => priceOf(a) - priceOf(b));
    const id = idOf(sorted[0]);
    return id != null ? Number(id) : null;
  }

  /** Admin: sipariş için Kargonomi gönderisi oluştur ve kargoya ver. */
  async shipOrder(orderId: string) {
    if (!this.config.get<string>('KARGONOMI_API_TOKEN')) {
      throw new BadRequestException(
        'Kargonomi API token tanımlı değil (KARGONOMI_API_TOKEN).',
      );
    }
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { address: true, user: true, items: true },
    });
    if (!order) throw new NotFoundException('Sipariş bulunamadı');
    if (order.kargonomiShipmentId) {
      throw new BadRequestException(
        `Bu sipariş için zaten Kargonomi gönderisi var (#${order.kargonomiShipmentId}).`,
      );
    }
    const addr = order.address;
    if (!addr) throw new BadRequestException('Siparişte teslimat adresi yok');

    // Gönderici: Kargonomi panelinde tanımlı depo (warehouse) id'si
    const warehouseId = Number(this.config.get<string>('KARGONOMI_WAREHOUSE_ID'));
    if (!warehouseId) {
      throw new BadRequestException(
        'Gönderici deposu tanımlı değil (KARGONOMI_WAREHOUSE_ID). Kargonomi panelinde depo oluşturup id\'sini .env\'e ekleyin.',
      );
    }

    // İl/ilçe → Kargonomi id
    const loc = await this.kargonomi.resolveLocationIds(addr.city, addr.district);
    if (!loc.stateId) {
      this.logger.error(
        `Kargonomi il eşlemesi bulunamadı: "${addr.city}". /states yanıtı: ${JSON.stringify(loc.raw).slice(0, 400)}`,
      );
      throw new BadRequestException(
        `Kargonomi il eşlemesi bulunamadı: ${addr.city}. Adres ilini kontrol edin.`,
      );
    }

    const buyerName = `${addr.firstName || ''} ${addr.lastName || ''}`.trim();
    const buyerAddress = [addr.line1, addr.line2, addr.district, addr.city]
      .filter(Boolean)
      .join(' ')
      .trim();
    const desi = Number(this.config.get<string>('KARGONOMI_DEFAULT_DESI')) || 1;

    const body: any = {
      warehouse_id: warehouseId,
      buyer_name: buyerName.length >= 5 ? buyerName : `${buyerName} .`,
      buyer_email: order.user?.email || undefined,
      buyer_phone: this.normalizePhone(addr.phone || order.user?.phone || ''),
      buyer_address:
        buyerAddress.length >= 10 ? buyerAddress : `${buyerAddress} ${addr.city}`,
      buyer_state_id: loc.stateId,
      buyer_city_id: loc.cityId || undefined,
      packages: [{ content: 'Kahve ürünleri', desi }],
    };

    // 1) Gönderi oluştur (draft)
    const created: any = await this.kargonomi.createShipment(body);
    const shipmentId = Number(created?.id ?? created?.data?.id);
    if (!shipmentId) {
      this.logger.error(`Kargonomi gönderi oluşturulamadı: ${JSON.stringify(created).slice(0, 400)}`);
      throw new BadRequestException('Kargonomi gönderisi oluşturulamadı');
    }

    // 2) Fiyat karşılaştır → en ucuz firma
    const comparison = await this.kargonomi.getPriceComparison(shipmentId);
    const providerId = this.pickCheapestProviderId(comparison);
    if (!providerId) {
      this.logger.error(
        `Kargonomi fiyat karşılaştırma boş/okunamadı: ${JSON.stringify(comparison).slice(0, 400)}`,
      );
      throw new BadRequestException(
        'Kargonomi fiyat teklifi alınamadı (firma/bakiye kontrol edin).',
      );
    }

    // 3) Seçilen firmayı onayla
    await this.kargonomi.confirmShipping({ shipment_id: shipmentId, provider_id: providerId });

    // Takip no (henüz oluşmamış olabilir; webhook ile dolar)
    let trackingCode: string | null = null;
    try {
      const detail: any = await this.kargonomi.getShipment(shipmentId);
      trackingCode = detail?.shipping_webservice_tracking_code || null;
    } catch {}

    // Siparişe yaz + durumu SHIPPED (kargo maili OrderService üzerinden gider)
    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        kargonomiShipmentId: shipmentId,
        trackingNumber: trackingCode || undefined,
      },
    });
    await this.orderService.updateStatus(
      orderId,
      OrderStatus.SHIPPED,
      undefined,
      'Kargonomi ile kargoya verildi',
    );

    this.logger.log(
      `Kargonomi gönderisi #${shipmentId} (sipariş ${order.orderNumber}, firma ${providerId}) oluşturuldu.`,
    );
    return { shipmentId, providerId, trackingCode };
  }

  /** Webhook: shipment.updated → siparişi güncelle. */
  async handleWebhookEvent(body: any) {
    const shipment = body?.shipment || body?.data?.shipment || body?.data;
    const kid = Number(shipment?.id);
    if (!kid) return { handled: false };

    const order = await this.prisma.order.findFirst({
      where: { kargonomiShipmentId: kid },
      select: { id: true, status: true, trackingNumber: true, orderNumber: true },
    });
    if (!order) {
      this.logger.warn(`Kargonomi webhook: eşleşen sipariş yok (shipment ${kid})`);
      return { handled: false };
    }

    const tracking = shipment?.shipping_webservice_tracking_code;
    if (tracking && order.trackingNumber !== tracking) {
      await this.prisma.order.update({
        where: { id: order.id },
        data: { trackingNumber: tracking },
      });
    }

    const mapped = this.STATUS_MAP[String(shipment?.status)];
    if (mapped && order.status !== mapped) {
      // OrderService: statusHistory + müşteriye otomatik mail (DELIVERED vb.)
      await this.orderService.updateStatus(
        order.id,
        mapped,
        undefined,
        `Kargo durumu güncellendi (Kargonomi: ${shipment?.status})`,
      );
      this.logger.log(
        `Kargonomi webhook: sipariş ${order.orderNumber} → ${mapped}`,
      );
    }
    return { handled: true };
  }
}
