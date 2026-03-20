import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  // ══════════════════════════════════════════════
  // ADDRESS MANAGEMENT (Adres Yönetimi)
  // ══════════════════════════════════════════════

  async getAddresses(userId: string) {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async getAddress(userId: string, addressId: string) {
    const address = await this.prisma.address.findFirst({
      where: { id: addressId, userId },
    });
    if (!address) throw new NotFoundException('Adres bulunamadı');
    return address;
  }

  async createAddress(
    userId: string,
    data: {
      title: string;
      firstName: string;
      lastName: string;
      phone: string;
      line1: string;
      line2?: string;
      city: string;
      district: string;
      postalCode: string;
      country?: string;
      isDefault?: boolean;
    },
  ) {
    // Eğer bu varsayılan yapılacaksa, diğerlerini varsayılan olmaktan çıkar
    if (data.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    // İlk adres ise otomatik varsayılan yap
    const existingCount = await this.prisma.address.count({
      where: { userId },
    });
    if (existingCount === 0) {
      data.isDefault = true;
    }

    return this.prisma.address.create({
      data: {
        ...data,
        userId,
        country: data.country || 'TR',
      },
    });
  }

  async updateAddress(
    userId: string,
    addressId: string,
    data: Partial<{
      title: string;
      firstName: string;
      lastName: string;
      phone: string;
      line1: string;
      line2: string;
      city: string;
      district: string;
      postalCode: string;
      country: string;
      isDefault: boolean;
    }>,
  ) {
    const _address = await this.getAddress(userId, addressId);

    if (data.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId, id: { not: addressId } },
        data: { isDefault: false },
      });
    }

    return this.prisma.address.update({
      where: { id: addressId },
      data,
    });
  }

  async deleteAddress(userId: string, addressId: string) {
    const address = await this.getAddress(userId, addressId);

    await this.prisma.address.delete({ where: { id: addressId } });

    // Silinen varsayılan idiyse, başka birini varsayılan yap
    if (address.isDefault) {
      const firstAddress = await this.prisma.address.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
      if (firstAddress) {
        await this.prisma.address.update({
          where: { id: firstAddress.id },
          data: { isDefault: true },
        });
      }
    }

    return { message: 'Adres silindi' };
  }

  async setDefaultAddress(userId: string, addressId: string) {
    await this.getAddress(userId, addressId);

    await this.prisma.$transaction([
      this.prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      }),
      this.prisma.address.update({
        where: { id: addressId },
        data: { isDefault: true },
      }),
    ]);

    return { message: 'Varsayılan adres güncellendi' };
  }

  // ══════════════════════════════════════════════
  // WISHLIST / FAVORİLER
  // ══════════════════════════════════════════════

  async getWishlist(userId: string) {
    let wishlist = await this.prisma.wishlist.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { take: 1 },
                category: true,
              },
            },
          },
          orderBy: { addedAt: 'desc' },
        },
      },
    });

    if (!wishlist) {
      wishlist = await this.prisma.wishlist.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: { take: 1 },
                  category: true,
                },
              },
            },
          },
        },
      });
    }

    return wishlist;
  }

  async addToWishlist(userId: string, productId: string) {
    // Ürünün varlığını kontrol et
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException('Ürün bulunamadı');

    // Wishlist'i al veya oluştur
    let wishlist = await this.prisma.wishlist.findUnique({
      where: { userId },
    });

    if (!wishlist) {
      wishlist = await this.prisma.wishlist.create({
        data: { userId },
      });
    }

    // Zaten ekliyse hata verme, sadece dön
    const existing = await this.prisma.wishlistItem.findUnique({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,
          productId,
        },
      },
    });

    if (existing) {
      return { message: 'Ürün zaten favorilerde', alreadyExists: true };
    }

    await this.prisma.wishlistItem.create({
      data: {
        wishlistId: wishlist.id,
        productId,
      },
    });

    return { message: 'Ürün favorilere eklendi' };
  }

  async removeFromWishlist(userId: string, productId: string) {
    const wishlist = await this.prisma.wishlist.findUnique({
      where: { userId },
    });

    if (!wishlist) {
      return { message: 'Ürün favorilerde değildi' };
    }

    await this.prisma.wishlistItem.deleteMany({
      where: {
        wishlistId: wishlist.id,
        productId,
      },
    });

    return { message: 'Ürün favorilerden çıkarıldı' };
  }

  async isInWishlist(userId: string, productId: string): Promise<boolean> {
    const wishlist = await this.prisma.wishlist.findUnique({
      where: { userId },
    });

    if (!wishlist) return false;

    const item = await this.prisma.wishlistItem.findUnique({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,
          productId,
        },
      },
    });

    return !!item;
  }

  // ══════════════════════════════════════════════
  // PROFILE UPDATE
  // ══════════════════════════════════════════════

  async updateProfile(
    userId: string,
    data: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      avatar?: string;
      marketingConsent?: boolean;
    },
  ) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        role: true,
        emailVerified: true,
        marketingConsent: true,
        createdAt: true,
      },
    });
  }
}
