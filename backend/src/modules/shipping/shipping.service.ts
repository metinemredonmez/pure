import {
  Injectable,
  BadRequestException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ShippingCarrier, ShipmentStatus, OrderStatus } from '@prisma/client';
import { YurticiCarrier } from './carriers/yurtici.carrier';
import { ArasCarrier } from './carriers/aras.carrier';
import { MngCarrier } from './carriers/mng.carrier';
import {
  CarrierInterface,
  ShipmentRequest,
} from './carriers/carrier.interface';

@Injectable()
export class ShippingService {
  private readonly logger = new Logger(ShippingService.name);

  constructor(
    private prisma: PrismaService,
    private yurticiCarrier: YurticiCarrier,
    private arasCarrier: ArasCarrier,
    private mngCarrier: MngCarrier,
  ) {}

  // ══════════════════════════════════════════════
  // LIST SHIPMENTS (ADMIN)
  // ══════════════════════════════════════════════

  async getShipments(filters: { page?: number; limit?: number; status?: string }) {
    const { page = 1, limit = 10, status } = filters;

    const where: any = {};
    if (status) where.status = status;

    const [shipments, total] = await Promise.all([
      this.prisma.shipmentRecord.findMany({
        where,
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              user: { select: { email: true, firstName: true, lastName: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.shipmentRecord.count({ where }),
    ]);

    return {
      data: shipments.map((s) => ({
        id: s.id,
        trackingNumber: s.trackingNumber,
        carrier: s.carrier,
        status: s.status,
        estimatedDelivery: s.estimatedDelivery,
        order: s.order ? { id: s.order.id, orderNumber: s.order.orderNumber } : null,
        user: s.order?.user || null,
        createdAt: s.createdAt,
      })),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async updateShipmentRecord(id: string, data: Record<string, any>) {
    return this.prisma.shipmentRecord.update({
      where: { id },
      data,
    });
  }

  // ══════════════════════════════════════════════
  // CARRIER ROUTING
  // ══════════════════════════════════════════════

  private getCarrier(carrier: ShippingCarrier): CarrierInterface {
    switch (carrier) {
      case ShippingCarrier.YURTICI:
        return this.yurticiCarrier;
      case ShippingCarrier.ARAS:
        return this.arasCarrier;
      case ShippingCarrier.MNG:
        return this.mngCarrier;
      default:
        throw new BadRequestException(`Unknown carrier: ${carrier}`);
    }
  }

  // ══════════════════════════════════════════════
  // ADMIN: SHIPMENT MANAGEMENT
  // ══════════════════════════════════════════════

  /**
   * Create shipment for order
   */
  async createShipment(orderId: string, carrier: ShippingCarrier) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        address: true,
        items: true,
        shipments: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Sipariş bulunamadı');
    }

    if (
      order.status !== OrderStatus.CONFIRMED &&
      order.status !== OrderStatus.PREPARING
    ) {
      throw new BadRequestException('Sipariş kargoya verilecek durumda değil');
    }

    // Check if already shipped
    const existingShipment = order.shipments.find(
      (s) => s.status !== ShipmentStatus.CANCELLED,
    );
    if (existingShipment) {
      throw new BadRequestException('Sipariş zaten kargoya verilmiş');
    }

    // Calculate total weight
    const totalWeight = order.items.reduce((sum, item) => {
      return sum + item.quantity * 0.5; // Varsayılan 500g per item
    }, 0);

    // Get shipping settings
    const _settings = await this.getSettings();

    // Prepare shipment request
    const request: ShipmentRequest = {
      orderId: order.id,
      orderNumber: order.orderNumber,
      senderName: 'Olentia Pure',
      senderPhone: '+90 212 000 0000',
      senderAddress: 'Olentia Merkez Ofis',
      senderCity: 'İstanbul',
      senderDistrict: 'Kadıköy',
      senderPostalCode: '34710',
      recipientName: `${order.address.firstName} ${order.address.lastName}`,
      recipientPhone: order.address.phone,
      recipientAddress:
        `${order.address.line1} ${order.address.line2 || ''}`.trim(),
      recipientCity: order.address.city,
      recipientDistrict: order.address.district,
      recipientPostalCode: order.address.postalCode,
      weight: totalWeight,
      itemCount: order.items.length,
      itemDescription: 'Kahve ürünleri',
      totalValue: Number(order.total),
    };

    // Call carrier API
    const carrierService = this.getCarrier(carrier);
    const result = await carrierService.createShipment(request);

    if (!result.success) {
      throw new BadRequestException(`Kargo oluşturulamadı: ${result.error}`);
    }

    // Create shipment record + status history in transaction
    const shipment = await this.prisma.$transaction(async (tx) => {
      const newShipment = await tx.shipmentRecord.create({
        data: {
          orderId: order.id,
          carrier,
          trackingNumber: result.trackingNumber,
          status: ShipmentStatus.PREPARING,
          weight: totalWeight,
          desi: Math.ceil(totalWeight * 1.5),
          estimatedDelivery: result.estimatedDelivery,
          carrierData: result.rawResponse,
        },
      });

      await tx.shipmentStatusHistory.create({
        data: {
          shipmentId: newShipment.id,
          status: ShipmentStatus.PREPARING,
          description: 'Kargo kaydı oluşturuldu',
          timestamp: new Date(),
        },
      });

      return newShipment;
    });

    this.logger.log(
      `Shipment created: ${shipment.id} for order ${order.orderNumber}`,
    );

    return shipment;
  }

  /**
   * Ship order (mark as shipped with tracking number)
   */
  async shipOrder(orderId: string) {
    const shipment = await this.prisma.shipmentRecord.findFirst({
      where: {
        orderId,
        status: ShipmentStatus.PREPARING,
      },
    });

    if (!shipment) {
      throw new NotFoundException('Hazırlanan kargo kaydı bulunamadı');
    }

    // All updates in a single transaction
    await this.prisma.$transaction(async (tx) => {
      await tx.shipmentRecord.update({
        where: { id: shipment.id },
        data: {
          status: ShipmentStatus.SHIPPED,
          shippedAt: new Date(),
        },
      });

      await tx.shipmentStatusHistory.create({
        data: {
          shipmentId: shipment.id,
          status: ShipmentStatus.SHIPPED,
          description: 'Kargo gönderildi',
          timestamp: new Date(),
        },
      });

      await tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.SHIPPED,
          trackingNumber: shipment.trackingNumber,
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status: OrderStatus.SHIPPED,
          note: `Kargo takip no: ${shipment.trackingNumber}`,
        },
      });
    });

    this.logger.log(
      `Order shipped: ${orderId}, tracking: ${shipment.trackingNumber}`,
    );

    return shipment;
  }

  /**
   * Get label PDF URL
   */
  async getLabel(orderId: string) {
    const shipment = await this.prisma.shipmentRecord.findFirst({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
    });

    if (!shipment || !shipment.trackingNumber) {
      throw new NotFoundException('Kargo kaydı bulunamadı');
    }

    const carrier = this.getCarrier(shipment.carrier);
    const result = await carrier.getLabel(shipment.trackingNumber);

    if (!result.success) {
      throw new BadRequestException(`Etiket alınamadı: ${result.error}`);
    }

    // Update label URL in shipment
    if (result.labelUrl) {
      await this.prisma.shipmentRecord.update({
        where: { id: shipment.id },
        data: { labelUrl: result.labelUrl },
      });
    }

    return {
      trackingNumber: shipment.trackingNumber,
      labelUrl: result.labelUrl,
      labelPdf: result.labelPdf,
    };
  }

  /**
   * Create return shipment
   */
  async createReturn(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { shipments: true },
    });

    if (!order) {
      throw new NotFoundException('Sipariş bulunamadı');
    }

    const originalShipment = order.shipments.find(
      (s) => s.status === ShipmentStatus.DELIVERED,
    );

    if (!originalShipment) {
      throw new BadRequestException('Teslim edilmiş kargo bulunamadı');
    }

    const carrier = this.getCarrier(originalShipment.carrier);
    const result = await carrier.createReturn(originalShipment.trackingNumber!);

    if (!result.success) {
      throw new BadRequestException(
        `İade kargo oluşturulamadı: ${result.error}`,
      );
    }

    // Create return shipment record
    const returnShipment = await this.prisma.shipmentRecord.create({
      data: {
        orderId: order.id,
        carrier: originalShipment.carrier,
        trackingNumber: result.trackingNumber,
        status: ShipmentStatus.PREPARING,
        carrierData: result.rawResponse,
      },
    });

    // Update order status
    await this.prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.RETURNED },
    });

    this.logger.log(
      `Return shipment created: ${returnShipment.id} for order ${order.orderNumber}`,
    );

    return returnShipment;
  }

  /**
   * Get orders ready for shipping
   */
  async getOrdersToShip() {
    const orders = await this.prisma.order.findMany({
      where: {
        status: {
          in: [OrderStatus.CONFIRMED, OrderStatus.PREPARING],
        },
        shipments: {
          none: {},
        },
      },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        address: true,
        items: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return orders;
  }

  /**
   * Get shipping dashboard stats
   */
  async getDashboard() {
    const [preparing, shipped, inTransit, delivered, returned] =
      await Promise.all([
        this.prisma.shipmentRecord.count({
          where: { status: ShipmentStatus.PREPARING },
        }),
        this.prisma.shipmentRecord.count({
          where: { status: ShipmentStatus.SHIPPED },
        }),
        this.prisma.shipmentRecord.count({
          where: {
            status: {
              in: [ShipmentStatus.IN_TRANSIT, ShipmentStatus.OUT_FOR_DELIVERY],
            },
          },
        }),
        this.prisma.shipmentRecord.count({
          where: { status: ShipmentStatus.DELIVERED },
        }),
        this.prisma.shipmentRecord.count({
          where: { status: ShipmentStatus.RETURNED },
        }),
      ]);

    // Recent shipments
    const recentShipments = await this.prisma.shipmentRecord.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        order: { select: { orderNumber: true } },
      },
    });

    return {
      stats: {
        preparing,
        shipped,
        inTransit,
        delivered,
        returned,
        total: preparing + shipped + inTransit + delivered + returned,
      },
      recentShipments,
    };
  }

  // ══════════════════════════════════════════════
  // USER: TRACKING
  // ══════════════════════════════════════════════

  /**
   * Get tracking info for order (cached from DB)
   */
  async getTracking(orderId: string) {
    const shipment = await this.prisma.shipmentRecord.findFirst({
      where: { orderId },
      include: {
        statusHistory: {
          orderBy: { timestamp: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!shipment) {
      throw new NotFoundException('Kargo kaydı bulunamadı');
    }

    return {
      trackingNumber: shipment.trackingNumber,
      carrier: shipment.carrier,
      status: shipment.status,
      shippedAt: shipment.shippedAt,
      estimatedDelivery: shipment.estimatedDelivery,
      deliveredAt: shipment.deliveredAt,
      history: shipment.statusHistory,
    };
  }

  /**
   * Get live tracking from carrier API
   */
  async getLiveTracking(orderId: string) {
    const shipment = await this.prisma.shipmentRecord.findFirst({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
    });

    if (!shipment || !shipment.trackingNumber) {
      throw new NotFoundException('Kargo kaydı bulunamadı');
    }

    const carrier = this.getCarrier(shipment.carrier);
    const result = await carrier.getStatus(shipment.trackingNumber);

    if (!result.success) {
      throw new BadRequestException(`Takip sorgulanamadı: ${result.error}`);
    }

    // Update shipment status if changed
    if (result.currentStatus) {
      const newStatus = this.mapCarrierStatus(result.currentStatus);
      if (newStatus !== shipment.status) {
        await this.updateShipmentStatus(
          shipment.id,
          newStatus,
          result.currentLocation,
        );
      }
    }

    return {
      trackingNumber: shipment.trackingNumber,
      carrier: shipment.carrier,
      currentStatus: result.currentStatus,
      currentLocation: result.currentLocation,
      isDelivered: result.isDelivered,
      deliveredAt: result.deliveredAt,
      history: result.history,
    };
  }

  // ══════════════════════════════════════════════
  // WEBHOOK: STATUS UPDATES
  // ══════════════════════════════════════════════

  /**
   * Handle carrier webhook
   */
  async handleWebhook(
    carrier: ShippingCarrier,
    data: {
      trackingNumber: string;
      status: string;
      location?: string;
      description?: string;
      timestamp?: string;
    },
  ) {
    const shipment = await this.prisma.shipmentRecord.findUnique({
      where: { trackingNumber: data.trackingNumber },
    });

    if (!shipment) {
      this.logger.warn(
        `Shipment not found for webhook: ${data.trackingNumber}`,
      );
      return { success: false, error: 'Shipment not found' };
    }

    const newStatus = this.mapCarrierStatus(data.status);
    const timestamp = data.timestamp ? new Date(data.timestamp) : new Date();

    // Add status history
    await this.prisma.shipmentStatusHistory.create({
      data: {
        shipmentId: shipment.id,
        status: newStatus,
        location: data.location,
        description: data.description,
        timestamp,
        rawData: data as any,
      },
    });

    // Update shipment
    await this.updateShipmentStatus(shipment.id, newStatus, data.location);

    this.logger.log(
      `Webhook processed: ${data.trackingNumber} -> ${newStatus}`,
    );

    return { success: true };
  }

  // ══════════════════════════════════════════════
  // SHIPPING COST CALCULATION
  // ══════════════════════════════════════════════

  /**
   * Calculate shipping cost
   */
  async calculateShippingCost(params: {
    weight: number; // kg
    city: string;
    carrier?: ShippingCarrier;
    isExpress?: boolean;
    cartTotal?: number;
  }) {
    const settings = await this.getSettings();
    const zone = await this.findZone(params.city);

    // Check free shipping
    if (
      settings.freeShippingEnabled &&
      params.cartTotal &&
      params.cartTotal >= Number(settings.freeShippingThreshold)
    ) {
      return {
        cost: 0,
        isFree: true,
        freeShippingThreshold: Number(settings.freeShippingThreshold),
        estimatedDays: zone?.estimatedDays || 3,
      };
    }

    // Calculate base cost
    let cost = zone ? Number(zone.baseCost) : 30; // Default 30 TL

    // Add extra weight cost
    if (params.weight > 1) {
      const extraKg = Math.ceil(params.weight - 1);
      const extraCost = zone ? Number(zone.extraKgCost) : 5;
      cost += extraKg * extraCost;
    }

    // Add express fee
    if (params.isExpress) {
      cost += Number(settings.expressDeliveryFee);
    }

    // Compare carriers if requested
    const carrierPrices = !params.carrier
      ? [
          { carrier: ShippingCarrier.YURTICI, cost: cost * 1.0 },
          { carrier: ShippingCarrier.ARAS, cost: cost * 0.95 },
          { carrier: ShippingCarrier.MNG, cost: cost * 1.05 },
        ]
      : undefined;

    return {
      cost: Math.round(cost * 100) / 100,
      isFree: false,
      freeShippingThreshold: Number(settings.freeShippingThreshold),
      remainingForFree: params.cartTotal
        ? Math.max(0, Number(settings.freeShippingThreshold) - params.cartTotal)
        : undefined,
      estimatedDays: zone?.estimatedDays || 3,
      carrierPrices,
    };
  }

  // ══════════════════════════════════════════════
  // ZONES
  // ══════════════════════════════════════════════

  async getZones() {
    return this.prisma.shippingZone.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  // ══════════════════════════════════════════════
  // SETTINGS
  // ══════════════════════════════════════════════

  async getSettings() {
    let settings = await this.prisma.shippingSettings.findFirst();

    if (!settings) {
      // Create default settings
      settings = await this.prisma.shippingSettings.create({
        data: {
          defaultCarrier: ShippingCarrier.YURTICI,
          freeShippingEnabled: true,
          freeShippingThreshold: 500,
          expressDeliveryFee: 25,
          maxWeight: 30,
        },
      });
    }

    return settings;
  }

  async updateSettings(data: {
    defaultCarrier?: ShippingCarrier;
    freeShippingEnabled?: boolean;
    freeShippingThreshold?: number;
    expressDeliveryFee?: number;
    maxWeight?: number;
  }) {
    const settings = await this.getSettings();

    return this.prisma.shippingSettings.update({
      where: { id: settings.id },
      data,
    });
  }

  // ══════════════════════════════════════════════
  // HELPERS
  // ══════════════════════════════════════════════

  private async findZone(city: string) {
    // Query DB with case-insensitive city match using has filter
    const zone = await this.prisma.shippingZone.findFirst({
      where: {
        isActive: true,
        cities: { has: city },
      },
    });

    if (zone) return zone;

    // Fallback: try case-insensitive search
    const zones = await this.prisma.shippingZone.findMany({
      where: { isActive: true },
    });
    return zones.find((z) =>
      z.cities.some((c) => c.toLowerCase() === city.toLowerCase()),
    );
  }

  private mapCarrierStatus(status: string): ShipmentStatus {
    const statusMap: Record<string, ShipmentStatus> = {
      PREPARING: ShipmentStatus.PREPARING,
      SHIPPED: ShipmentStatus.SHIPPED,
      IN_TRANSIT: ShipmentStatus.IN_TRANSIT,
      OUT_FOR_DELIVERY: ShipmentStatus.OUT_FOR_DELIVERY,
      DELIVERED: ShipmentStatus.DELIVERED,
      RETURNED: ShipmentStatus.RETURNED,
      CANCELLED: ShipmentStatus.CANCELLED,
      // Carrier-specific mappings
      KABUL: ShipmentStatus.SHIPPED,
      TRANSFER: ShipmentStatus.IN_TRANSIT,
      DAGITIMDA: ShipmentStatus.OUT_FOR_DELIVERY,
      TESLIM: ShipmentStatus.DELIVERED,
      IADE: ShipmentStatus.RETURNED,
    };

    return statusMap[status.toUpperCase()] || ShipmentStatus.IN_TRANSIT;
  }

  private async updateShipmentStatus(
    shipmentId: string,
    status: ShipmentStatus,
    _location?: string,
  ) {
    const updateData: any = { status };

    if (status === ShipmentStatus.DELIVERED) {
      updateData.deliveredAt = new Date();
    } else if (status === ShipmentStatus.RETURNED) {
      updateData.returnedAt = new Date();
    }

    await this.prisma.shipmentRecord.update({
      where: { id: shipmentId },
      data: updateData,
    });

    // Update order status
    const shipment = await this.prisma.shipmentRecord.findUnique({
      where: { id: shipmentId },
    });

    if (shipment) {
      let orderStatus: OrderStatus | undefined;

      switch (status) {
        case ShipmentStatus.IN_TRANSIT:
          orderStatus = OrderStatus.IN_TRANSIT;
          break;
        case ShipmentStatus.DELIVERED:
          orderStatus = OrderStatus.DELIVERED;
          break;
        case ShipmentStatus.RETURNED:
          orderStatus = OrderStatus.RETURNED;
          break;
      }

      if (orderStatus) {
        await this.prisma.order.update({
          where: { id: shipment.orderId },
          data: { status: orderStatus },
        });
      }
    }
  }
}
