import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import {
  PaginationDto,
  PaginatedResult,
} from '../../common/pipes/pagination.pipe';
import { OrderStatus, PaymentMethod } from '@prisma/client';
import { PaymentService } from '../payment/payment.service';

@Injectable()
export class OrderService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private payment: PaymentService,
  ) {}

  /**
   * Üyeliksiz (misafir) checkout. E-postadan misafir müşteriyi bul/oluştur,
   * adres + sipariş oluştur, PayTR ödeme oturumunu başlat. Login gerektirmez.
   */
  async createGuestCheckout(
    data: {
      email: string;
      firstName: string;
      lastName: string;
      phone: string;
      line1: string;
      line2?: string;
      city: string;
      district: string;
      postalCode?: string;
      couponCode?: string;
      note?: string;
      method?: PaymentMethod;
      items: { productId: string; variantId?: string; quantity?: number }[];
    },
    userIp?: string,
  ) {
    const email = String(data.email || '').trim().toLowerCase();
    if (!email) throw new BadRequestException('E-posta adresi gerekli');

    // Misafir müşteriyi bul veya oluştur (şifresiz — passwordHash nullable).
    // E-posta zaten kayıtlıysa sipariş o hesaba bağlanır; müşteri giriş yapınca
    // siparişlerinde görür.
    let user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          firstName: (data.firstName || 'Misafir').trim(),
          lastName: (data.lastName || '').trim(),
          phone: data.phone?.trim() || null,
          role: 'CUSTOMER',
          provider: 'LOCAL',
          emailVerified: false,
        },
      });
    }

    const address = await this.prisma.address.create({
      data: {
        userId: user.id,
        title: 'Teslimat',
        firstName: (data.firstName || '').trim(),
        lastName: (data.lastName || '').trim(),
        phone: (data.phone || '').trim(),
        line1: (data.line1 || '').trim(),
        line2: data.line2?.trim() || null,
        city: (data.city || '').trim(),
        district: (data.district || '').trim(),
        postalCode: (data.postalCode || '').trim(),
        country: 'TR',
        isDefault: true,
      },
    });

    const order = await this.create(user.id, {
      addressId: address.id,
      couponCode: data.couponCode,
      note: data.note,
      items: data.items,
    });

    const method = data.method || PaymentMethod.CREDIT_CARD;
    const session: any = await this.payment.createCheckoutSession(
      order.id,
      method,
      userIp,
    );

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      ...session,
    };
  }

  async create(
    userId: string,
    data: {
      addressId: string;
      couponCode?: string;
      note?: string;
      items?: { productId: string; variantId?: string; quantity?: number }[];
    },
  ) {
    // Use transaction for atomic order creation with stock management
    return this.prisma.$transaction(
      async (tx) => {
        const requestedItems = (data.items || []).filter(
          (item) => item.productId && (item.quantity || 1) > 0,
        );

        let cart: any = null;
        let sourceItems: any[] = [];

        if (requestedItems.length > 0) {
          sourceItems = await Promise.all(
            requestedItems.map(async (item) => {
              const product = await tx.product.findUnique({
                where: { id: item.productId },
              });
              if (!product || !product.isActive || product.status !== 'ACTIVE') {
                throw new NotFoundException('Product not found');
              }

              const variant = item.variantId
                ? await tx.productVariant.findFirst({
                    where: {
                      id: item.variantId,
                      productId: item.productId,
                      isActive: true,
                    },
                  })
                : null;

              if (item.variantId && !variant) {
                throw new NotFoundException('Product variant not found');
              }

              return {
                productId: item.productId,
                variantId: item.variantId || null,
                quantity: item.quantity || 1,
                product,
                variant,
              };
            }),
          );
        } else {
          // Fallback for API clients that still use the server-side cart.
          cart = await tx.cart.findFirst({
            where: { userId },
            include: {
              items: { include: { product: true, variant: true } },
            },
          });
          sourceItems = cart?.items || [];
        }

        if (sourceItems.length === 0) {
          throw new NotFoundException('Cart is empty');
        }

        // Validate stock availability and prepare order items
        let subtotal = 0;
        const orderItems: any[] = [];
        const stockUpdates: {
          variantId?: string;
          productId: string;
          quantity: number;
        }[] = [];

        for (const item of sourceItems) {
          // Check stock - use variant stock if variant exists, otherwise product stock
          const availableStock = item.variant
            ? item.variant.stock
            : item.product.stock;

          if (availableStock < item.quantity) {
            throw new BadRequestException(
              `Yetersiz stok: ${item.product.name}${item.variant ? ` (${item.variant.name})` : ''} - Mevcut: ${availableStock}, İstenen: ${item.quantity}`,
            );
          }

          const unitPrice = item.variant
            ? Number(item.variant.price)
            : Number(item.product.price);
          const totalPrice = unitPrice * item.quantity;
          subtotal += totalPrice;

          orderItems.push({
            productId: item.productId,
            variantId: item.variantId,
            productName: item.product.name,
            variantName: item.variant?.name,
            quantity: item.quantity,
            unitPrice,
            totalPrice,
          });

          stockUpdates.push({
            variantId: item.variantId || undefined,
            productId: item.productId,
            quantity: item.quantity,
          });
        }

        // Decrement stock atomically
        for (const update of stockUpdates) {
          if (update.variantId) {
            await tx.productVariant.update({
              where: { id: update.variantId },
              data: { stock: { decrement: update.quantity } },
            });
          } else {
            await tx.product.update({
              where: { id: update.productId },
              data: { stock: { decrement: update.quantity } },
            });
          }
        }

        // Apply coupon if provided.
        // ÖNEMLİ: Kupon arama/hesaplama admin.service.validateCoupon ile birebir
        // aynı olmalı (aksi halde ödeme sayfası indirim gösterir ama sipariş/PayTR
        // indirimsiz tutar çeker). Kod BÜYÜK HARFE çevrilerek aranır.
        let discount = 0;
        let couponFreeShipping = false;
        let couponId: string | null = null;
        if (data.couponCode) {
          const coupon = await tx.coupon.findUnique({
            where: { code: data.couponCode.toUpperCase() },
          });
          if (coupon && coupon.isActive) {
            // Check usage limits
            if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
              throw new BadRequestException('Kupon kullanım limiti dolmuş');
            }
            // Check expiry
            if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
              throw new BadRequestException('Kuponun süresi dolmuş');
            }
            // Minimum sipariş tutarı
            if (coupon.minOrderAmount && subtotal < Number(coupon.minOrderAmount)) {
              throw new BadRequestException(
                `Minimum sipariş tutarı: ₺${coupon.minOrderAmount}`,
              );
            }

            if (coupon.type === 'percentage') {
              discount = subtotal * (Number(coupon.value) / 100);
              // maxDiscount varsa uygula
              if (coupon.maxDiscount && discount > Number(coupon.maxDiscount)) {
                discount = Number(coupon.maxDiscount);
              }
            } else if (coupon.type === 'fixed') {
              discount = Number(coupon.value);
            } else if (coupon.type === 'free_shipping') {
              // free_shipping: indirim yok, kargo sıfırlanır (aşağıda)
              couponFreeShipping = true;
            }
            // İndirim ara toplamı aşamaz
            discount = Math.min(discount, subtotal);
            couponId = coupon.id;
            await tx.coupon.update({
              where: { id: coupon.id },
              data: { usedCount: { increment: 1 } },
            });
          }
        }

        // Admin'in /admin/settings sayfasından girdiği değerleri site_settings'ten oku.
        // Yoksa env / hardcoded varsayılana düş.
        const siteSettings = await tx.siteSettings.findMany({
          where: { key: { in: ['taxRate', 'freeShippingThreshold', 'shippingCost'] } },
        });
        const settingsMap: Record<string, any> = {};
        siteSettings.forEach((s) => { settingsMap[s.key] = s.value; });

        // Admin'de taxRate "% cinsinden" tutulur (örn 1, 10, 20). >=1 ise /100.
        // Not: "1" değeri %1 demektir (%100 DEĞİL) — eski >1 kontrolü 1'i %100 sanıp toplamı ikiye katlıyordu.
        let taxRate = this.config.get<number>('order.taxRate', 0.2);
        if (settingsMap.taxRate != null) {
          const n = Number(settingsMap.taxRate);
          if (Number.isFinite(n) && n >= 0) {
            taxRate = n >= 1 ? n / 100 : n;
          }
        }
        let freeShippingThreshold = this.config.get<number>('order.freeShippingThreshold', 500);
        if (settingsMap.freeShippingThreshold != null) {
          const n = Number(settingsMap.freeShippingThreshold);
          if (Number.isFinite(n) && n >= 0) freeShippingThreshold = n;
        }
        let defaultShippingCost = this.config.get<number>('order.defaultShippingCost', 39.9);
        if (settingsMap.shippingCost != null) {
          const n = Number(settingsMap.shippingCost);
          if (Number.isFinite(n) && n >= 0) defaultShippingCost = n;
        }

        const baseShippingCost =
          subtotal >= freeShippingThreshold ? 0 : defaultShippingCost;
        // free_shipping kuponu kargoyu sıfırlar
        const shippingCost = couponFreeShipping ? 0 : baseShippingCost;
        // Fiyatlar KDV DAHİL: KDV üstüne EKLENMEZ. `tax` sadece fiyatın içindeki
        // KDV tutarı (bilgi amaçlı). Toplam = ara toplam - indirim + kargo.
        const netAfterDiscount = Math.max(subtotal - discount, 0);
        const tax = netAfterDiscount - netAfterDiscount / (1 + taxRate);
        const total = netAfterDiscount + shippingCost;

        // Generate unique order number using timestamp + random suffix (race-safe)
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        const orderNumber = `OLN-${new Date().getFullYear()}-${timestamp}${random}`;

        const order = await tx.order.create({
          data: {
            orderNumber,
            userId,
            addressId: data.addressId,
            subtotal,
            shippingCost,
            discount,
            tax,
            total,
            couponId,
            note: data.note,
            items: { create: orderItems },
            statusHistory: {
              create: { status: OrderStatus.PENDING },
            },
          },
          include: { items: true, statusHistory: true },
        });

        // Clear cart
        if (cart) {
          await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
        }

        return order;
      },
      {
        // Use serializable isolation for stock operations
        isolationLevel: 'Serializable',
      },
    );
  }

  async findUserOrders(
    userId: string,
    query: PaginationDto,
  ): Promise<PaginatedResult<any>> {
    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { userId },
        include: { items: true, payment: true },
        skip: query.skip,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where: { userId } }),
    ]);

    return {
      data,
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  async findById(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: true, variant: true } },
        statusHistory: { orderBy: { createdAt: 'desc' } },
        payment: true,
        address: true,
        user: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  /**
   * Find order by ID with ownership check
   */
  /** Public tracking — match order by orderNumber + (user.email OR shipping address email) */
  async trackPublic(orderNumber?: string, email?: string) {
    if (!orderNumber || !email) {
      throw new NotFoundException('Sipariş numarası ve e-posta zorunlu');
    }
    const order = await this.prisma.order.findFirst({
      where: {
        orderNumber: orderNumber.trim(),
        user: { email: { equals: email.trim().toLowerCase(), mode: 'insensitive' } },
      },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        total: true,
        trackingNumber: true,
        trackingUrl: true,
        createdAt: true,
        updatedAt: true,
        statusHistory: {
          select: { status: true, note: true, createdAt: true },
          orderBy: { createdAt: 'asc' },
        },
        items: {
          select: {
            quantity: true,
            unitPrice: true,
            product: { select: { name: true, slug: true } },
          },
        },
      },
    });
    if (!order) throw new NotFoundException('Sipariş bulunamadı. Lütfen bilgileri kontrol edin.');
    return order;
  }

  async findByIdForUser(id: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: true, variant: true } },
        statusHistory: { orderBy: { createdAt: 'desc' } },
        payment: true,
        address: true,
      },
    });
    if (!order) throw new NotFoundException('Sipariş bulunamadı');
    if (order.userId !== userId) {
      throw new NotFoundException('Sipariş bulunamadı'); // Don't reveal existence
    }
    return order;
  }

  // ── Admin ──

  async findAll(query: PaginationDto): Promise<PaginatedResult<any>> {
    const where: any = {};
    if (query.search) {
      where.OR = [
        { orderNumber: { contains: query.search, mode: 'insensitive' } },
        { user: { email: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    // Ödeme durumu ayrımı: ödemesi alınmamış (PENDING) ve ödemesi başarısız
    // siparişler "bekleme/işlem" listesine karışmamalı. Belirli bir durum
    // seçildiyse o önceliklidir; yoksa paymentState gruplaması uygulanır.
    const UNPAID_STATUSES = ['PENDING', 'PAYMENT_FAILED'];
    if (query.status) {
      where.status = query.status;
    } else if (query.paymentState === 'paid') {
      where.status = { notIn: UNPAID_STATUSES };
    } else if (query.paymentState === 'unpaid') {
      where.status = { in: UNPAID_STATUSES };
    }

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          items: true,
          user: {
            select: { id: true, email: true, firstName: true, lastName: true },
          },
          payment: true,
        },
        skip: query.skip,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  async updateStatus(
    id: string,
    status: OrderStatus,
    changedBy?: string,
    note?: string,
  ) {
    await this.prisma.orderStatusHistory.create({
      data: { orderId: id, status, changedBy, note },
    });

    return this.prisma.order.update({
      where: { id },
      data: { status },
      include: {
        items: true,
        statusHistory: { orderBy: { createdAt: 'desc' } },
      },
    });
  }
}
