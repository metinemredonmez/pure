import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PriceChannel } from '@prisma/client';

@Injectable()
export class PricingService {
  constructor(private prisma: PrismaService) {}

  // ══════════════════════════════════════════════
  // FİYAT HESAPLAMA (Sipariş anında)
  // ══════════════════════════════════════════════

  /**
   * Kullanıcı rolüne ve miktara göre doğru fiyatı hesapla
   */
  async calculatePrice(
    productId: string,
    variantId: string | null,
    quantity: number,
    userId?: string,
    userRole?: string,
  ): Promise<{
    unitPrice: number;
    totalPrice: number;
    discount: number;
    channel: PriceChannel;
    volumeDiscount?: number;
  }> {
    // 1. Önce kullanıcıya özel fiyat kontrol et (B2B)
    if (userId) {
      const customerPrice = await this.prisma.customerPrice.findFirst({
        where: {
          customerId: userId,
          productId,
          variantId: variantId || null,
          isActive: true,
          OR: [{ startsAt: null }, { startsAt: { lte: new Date() } }],
        },
        orderBy: { minQuantity: 'desc' },
      });

      if (customerPrice && quantity >= customerPrice.minQuantity) {
        const unitPrice = Number(customerPrice.price);
        return {
          unitPrice,
          totalPrice: unitPrice * quantity,
          discount: customerPrice.discount ? Number(customerPrice.discount) : 0,
          channel: 'B2B' as PriceChannel,
        };
      }
    }

    // 2. Kanal bazlı fiyat bul
    const channel = this.getChannelForRole(userRole);
    const productPrice = await this.prisma.productPrice.findFirst({
      where: {
        productId,
        variantId: variantId || null,
        channel,
        isActive: true,
        minQuantity: { lte: quantity },
        OR: [{ startsAt: null }, { startsAt: { lte: new Date() } }],
        AND: [{ OR: [{ endsAt: null }, { endsAt: { gte: new Date() } }] }],
      },
      orderBy: { minQuantity: 'desc' },
    });

    // 3. Kanal fiyatı yoksa ürün base fiyatını kullan
    let unitPrice: number;
    if (productPrice) {
      unitPrice = Number(productPrice.price);
    } else {
      const product = variantId
        ? await this.prisma.productVariant.findUnique({
            where: { id: variantId },
          })
        : await this.prisma.product.findUnique({ where: { id: productId } });

      if (!product) throw new NotFoundException('Ürün bulunamadı');
      unitPrice = Number(product.price);
    }

    // 4. Toplu alım indirimi hesapla
    const volumeDiscount = await this.calculateVolumeDiscount(
      channel,
      quantity,
    );
    let discount = 0;

    if (volumeDiscount) {
      discount = volumeDiscount;
      unitPrice = unitPrice * (1 - discount / 100);
    }

    return {
      unitPrice: Math.round(unitPrice * 100) / 100,
      totalPrice: Math.round(unitPrice * quantity * 100) / 100,
      discount,
      channel,
      volumeDiscount: volumeDiscount || undefined,
    };
  }

  private getChannelForRole(role?: string): PriceChannel {
    switch (role) {
      case 'PARTNER':
        return 'PARTNER';
      case 'ADMIN':
      case 'SALES':
        return 'B2B'; // Admin/Sales B2B fiyatları görür
      default:
        return 'B2C';
    }
  }

  private async calculateVolumeDiscount(
    channel: PriceChannel,
    quantityGrams: number,
  ): Promise<number | null> {
    const volumeDiscount = await this.prisma.volumeDiscount.findFirst({
      where: {
        channel,
        isActive: true,
        minQuantity: { lte: quantityGrams },
        OR: [{ maxQuantity: null }, { maxQuantity: { gte: quantityGrams } }],
      },
      orderBy: { minQuantity: 'desc' },
    });

    return volumeDiscount ? Number(volumeDiscount.discountPercent) : null;
  }

  // ══════════════════════════════════════════════
  // ADMIN: KANAL BAZLI FİYAT YÖNETİMİ
  // ══════════════════════════════════════════════

  async getProductPrices(productId: string) {
    return this.prisma.productPrice.findMany({
      where: { productId },
      orderBy: [{ channel: 'asc' }, { minQuantity: 'asc' }],
    });
  }

  async setProductPrice(
    productId: string,
    data: {
      variantId?: string;
      channel: PriceChannel;
      price: number;
      minQuantity?: number;
      startsAt?: Date;
      endsAt?: Date;
    },
    changedBy: string,
  ) {
    const existing = await this.prisma.productPrice.findFirst({
      where: {
        productId,
        variantId: data.variantId || null,
        channel: data.channel,
        minQuantity: data.minQuantity || 1,
      },
    });

    // Fiyat değişikliği log'u
    if (existing) {
      await this.logPriceChange(
        productId,
        data.variantId || null,
        data.channel,
        Number(existing.price),
        data.price,
        changedBy,
        'Fiyat güncelleme',
      );

      return this.prisma.productPrice.update({
        where: { id: existing.id },
        data: {
          price: data.price,
          startsAt: data.startsAt,
          endsAt: data.endsAt,
          isActive: true,
        },
      });
    }

    // Yeni fiyat oluştur
    await this.logPriceChange(
      productId,
      data.variantId || null,
      data.channel,
      0,
      data.price,
      changedBy,
      'Yeni fiyat tanımı',
    );

    return this.prisma.productPrice.create({
      data: {
        productId,
        variantId: data.variantId,
        channel: data.channel,
        price: data.price,
        minQuantity: data.minQuantity || 1,
        startsAt: data.startsAt,
        endsAt: data.endsAt,
      },
    });
  }

  async deleteProductPrice(priceId: string) {
    await this.prisma.productPrice.delete({ where: { id: priceId } });
    return { message: 'Fiyat silindi' };
  }

  // ══════════════════════════════════════════════
  // B2B MÜŞTERİ ÖZEL FİYAT
  // ══════════════════════════════════════════════

  async setCustomerPrice(
    customerId: string,
    data: {
      productId: string;
      variantId?: string;
      contractId?: string;
      price: number;
      discount?: number;
      minQuantity?: number;
      startsAt?: Date;
      endsAt?: Date;
    },
    _changedBy: string,
  ) {
    const existing = await this.prisma.customerPrice.findFirst({
      where: {
        customerId,
        productId: data.productId,
        variantId: data.variantId || null,
        contractId: data.contractId || null,
      },
    });

    if (existing) {
      return this.prisma.customerPrice.update({
        where: { id: existing.id },
        data: {
          price: data.price,
          discount: data.discount,
          minQuantity: data.minQuantity || 1,
          startsAt: data.startsAt,
          endsAt: data.endsAt,
          isActive: true,
        },
      });
    }

    return this.prisma.customerPrice.create({
      data: {
        customerId,
        productId: data.productId,
        variantId: data.variantId,
        contractId: data.contractId,
        price: data.price,
        discount: data.discount,
        minQuantity: data.minQuantity || 1,
        startsAt: data.startsAt,
        endsAt: data.endsAt,
      },
    });
  }

  async getCustomerPrices(customerId: string) {
    return this.prisma.customerPrice.findMany({
      where: { customerId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteCustomerPrice(priceId: string) {
    await this.prisma.customerPrice.delete({ where: { id: priceId } });
    return { message: 'Müşteri fiyatı silindi' };
  }

  // ══════════════════════════════════════════════
  // TOPLU ALIM İNDİRİMLERİ
  // ══════════════════════════════════════════════

  async getVolumeDiscounts(channel?: PriceChannel) {
    return this.prisma.volumeDiscount.findMany({
      where: channel ? { channel, isActive: true } : { isActive: true },
      orderBy: [{ channel: 'asc' }, { minQuantity: 'asc' }],
    });
  }

  async setVolumeDiscount(data: {
    name: string;
    channel: PriceChannel;
    minQuantity: number;
    maxQuantity?: number;
    discountPercent: number;
  }) {
    return this.prisma.volumeDiscount.create({ data });
  }

  async updateVolumeDiscount(
    id: string,
    data: Partial<{
      name: string;
      channel: PriceChannel;
      minQuantity: number;
      maxQuantity: number;
      discountPercent: number;
      isActive: boolean;
    }>,
  ) {
    return this.prisma.volumeDiscount.update({ where: { id }, data });
  }

  async deleteVolumeDiscount(id: string) {
    await this.prisma.volumeDiscount.delete({ where: { id } });
    return { message: 'İndirim kuralı silindi' };
  }

  // ══════════════════════════════════════════════
  // FİYAT DEĞİŞİKLİK GEÇMİŞİ
  // ══════════════════════════════════════════════

  private async logPriceChange(
    productId: string,
    variantId: string | null,
    channel: PriceChannel,
    oldPrice: number,
    newPrice: number,
    changedBy: string,
    reason?: string,
  ) {
    return this.prisma.priceHistory.create({
      data: {
        productId,
        variantId,
        channel,
        oldPrice,
        newPrice,
        changeReason: reason,
        changedBy,
      },
    });
  }

  async getPriceHistory(
    productId: string,
    filters?: { channel?: PriceChannel; limit?: number },
  ) {
    return this.prisma.priceHistory.findMany({
      where: {
        productId,
        ...(filters?.channel && { channel: filters.channel }),
      },
      orderBy: { createdAt: 'desc' },
      take: filters?.limit || 50,
    });
  }

  // ══════════════════════════════════════════════
  // ABONELİK FİYATLAMA
  // ══════════════════════════════════════════════

  async getSubscriptionPrice(
    productId: string,
    variantId: string | null,
    planSlug: string,
  ): Promise<number> {
    // Plan indirim oranını al
    const plan = await this.prisma.subPlan.findUnique({
      where: { slug: planSlug },
    });

    if (!plan) throw new NotFoundException('Abonelik planı bulunamadı');

    // Subscription kanalı fiyatını al veya base price kullan
    const subPrice = await this.prisma.productPrice.findFirst({
      where: {
        productId,
        variantId: variantId || null,
        channel: 'SUBSCRIPTION',
        isActive: true,
      },
    });

    let basePrice: number;
    if (subPrice) {
      basePrice = Number(subPrice.price);
    } else {
      const product = variantId
        ? await this.prisma.productVariant.findUnique({
            where: { id: variantId },
          })
        : await this.prisma.product.findUnique({ where: { id: productId } });

      if (!product) throw new NotFoundException('Ürün bulunamadı');
      basePrice = Number(product.price);
    }

    // Plan indirimi uygula
    const discount = plan.discountPercent || 0;
    return Math.round(basePrice * (1 - discount / 100) * 100) / 100;
  }

  // ══════════════════════════════════════════════
  // PARTNER FİYATLAMA
  // ══════════════════════════════════════════════

  async getPartnerPrice(
    productId: string,
    variantId: string | null,
    _partnerId: string,
  ): Promise<{ cost: number; suggestedRetail: number; margin: number }> {
    // Partner kanalı fiyatını al
    const partnerPrice = await this.prisma.productPrice.findFirst({
      where: {
        productId,
        variantId: variantId || null,
        channel: 'PARTNER',
        isActive: true,
      },
    });

    // B2C fiyatı (önerilen satış fiyatı)
    const retailPrice = await this.prisma.productPrice.findFirst({
      where: {
        productId,
        variantId: variantId || null,
        channel: 'B2C',
        isActive: true,
      },
    });

    let cost: number;
    let suggestedRetail: number;

    if (partnerPrice) {
      cost = Number(partnerPrice.price);
    } else {
      // Yoksa ürün cost price kullan
      const product = await this.prisma.product.findUnique({
        where: { id: productId },
      });
      cost = product?.costPrice ? Number(product.costPrice) : 0;
    }

    if (retailPrice) {
      suggestedRetail = Number(retailPrice.price);
    } else {
      const product = await this.prisma.product.findUnique({
        where: { id: productId },
      });
      suggestedRetail = product ? Number(product.price) : 0;
    }

    const margin =
      suggestedRetail > 0
        ? Math.round(((suggestedRetail - cost) / suggestedRetail) * 100 * 10) /
          10
        : 0;

    return { cost, suggestedRetail, margin };
  }
}
