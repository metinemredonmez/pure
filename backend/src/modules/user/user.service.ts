import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRole, Prisma } from '@prisma/client';

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
      address?: string;
      city?: string;
      district?: string;
      postalCode?: string;
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
        address: true,
        city: true,
        district: true,
        postalCode: true,
        avatar: true,
        role: true,
        emailVerified: true,
        marketingConsent: true,
        createdAt: true,
      },
    });
  }

  // ══════════════════════════════════════════════
  // ADMIN USER MANAGEMENT
  // ══════════════════════════════════════════════

  async adminGetUsers(query: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: string;
  }) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};

    // Search by email, firstName, lastName
    if (query.search) {
      where.OR = [
        { email: { contains: query.search, mode: 'insensitive' } },
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search } },
      ];
    }

    // Filter by role
    if (query.role) {
      where.role = query.role as UserRole;
    }

    // Filter by isActive (ban status)
    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    // Sort
    const orderBy: Prisma.UserOrderByWithRelationInput = {};
    const sortField = query.sortBy || 'createdAt';
    const sortDir = query.sortOrder === 'asc' ? 'asc' : 'desc';
    orderBy[sortField] = sortDir;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          avatar: true,
          role: true,
          isActive: true,
          emailVerified: true,
          provider: true,
          isPartner: true,
          companyName: true,
          createdAt: true,
          _count: {
            select: {
              orders: true,
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async adminGetUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        role: true,
        isActive: true,
        emailVerified: true,
        provider: true,
        isPartner: true,
        companyName: true,
        taxNumber: true,
        partnerRegion: true,
        mfaEnabled: true,
        marketingConsent: true,
        createdAt: true,
        updatedAt: true,
        addresses: true,
        orders: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            orderNumber: true,
            status: true,
            total: true,
            createdAt: true,
          },
        },
        subscriptions: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            status: true,
            plan: { select: { name: true } },
            nextBillingDate: true,
          },
        },
        loyaltyAccount: {
          select: {
            availablePoints: true,
            tier: true,
            totalPoints: true,
          },
        },
        _count: {
          select: {
            orders: true,
          },
        },
      },
    });

    if (!user) throw new NotFoundException('Kullanıcı bulunamadı');

    // Calculate total spent
    const totalSpent = await this.prisma.order.aggregate({
      where: { userId, status: { in: ['DELIVERED', 'SHIPPED', 'CONFIRMED'] } },
      _sum: { total: true },
    });

    return {
      ...user,
      totalSpent: totalSpent._sum.total || 0,
    };
  }

  /**
   * Admin panel kullanıcısı oluşturur (ADMIN / SUPPORT / SALES).
   * SUPPORT & SALES: sipariş durumu değiştirebilir ama iptal/iade/silme yapamaz
   * (yetki uçlarda @Roles ile kısıtlıdır).
   */
  async adminCreateUser(data: {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    role?: string;
    phone?: string;
  }) {
    const email = data.email.trim().toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new BadRequestException('Bu e-posta zaten kayıtlı');
    }
    const PANEL_ROLES: UserRole[] = [
      UserRole.ADMIN,
      UserRole.SUPPORT,
      UserRole.SALES,
    ];
    const role =
      data.role && PANEL_ROLES.includes(data.role as UserRole)
        ? (data.role as UserRole)
        : UserRole.SUPPORT;
    if (!data.password || data.password.length < 6) {
      throw new BadRequestException('Şifre en az 6 karakter olmalı');
    }
    const passwordHash = await bcrypt.hash(data.password, 12);
    return this.prisma.user.create({
      data: {
        email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || null,
        role,
        passwordHash,
        emailVerified: true,
        provider: 'LOCAL',
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });
  }

  async adminUpdateRole(userId: string, role: string, adminId: string) {
    // Prevent self-demotion
    if (userId === adminId && role !== 'ADMIN') {
      throw new ForbiddenException('Kendi rolünüzü düşüremezsiniz');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Kullanıcı bulunamadı');

    return this.prisma.user.update({
      where: { id: userId },
      data: { role: role as UserRole },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });
  }

  async adminBanUser(userId: string, banned: boolean, reason?: string, adminId?: string) {
    // Prevent self-ban
    if (userId === adminId) {
      throw new ForbiddenException('Kendinizi banlayamazsınız');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Kullanıcı bulunamadı');

    // Don't allow banning admins
    if (user.role === 'ADMIN' && banned) {
      throw new ForbiddenException('Admin kullanıcıları banlayamazsınız');
    }

    // Update user
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { isActive: !banned },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
      },
    });

    // If banning, revoke all refresh tokens
    if (banned) {
      await this.prisma.refreshToken.deleteMany({ where: { userId } });
    }

    return {
      ...updatedUser,
      message: banned ? 'Kullanıcı banlandı' : 'Kullanıcı banı kaldırıldı',
      reason,
    };
  }

  async adminGetUserStats() {
    const [
      totalUsers,
      activeUsers,
      bannedUsers,
      adminUsers,
      partnerUsers,
      newUsersToday,
      newUsersThisMonth,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.user.count({ where: { isActive: false } }),
      this.prisma.user.count({ where: { role: 'ADMIN' } }),
      this.prisma.user.count({ where: { isPartner: true } }),
      this.prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      this.prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
    ]);

    // Role distribution
    const roleDistribution = await this.prisma.user.groupBy({
      by: ['role'],
      _count: true,
    });

    return {
      totalUsers,
      activeUsers,
      bannedUsers,
      adminUsers,
      partnerUsers,
      newUsersToday,
      newUsersThisMonth,
      roleDistribution: roleDistribution.map((r) => ({
        role: r.role,
        count: r._count,
      })),
    };
  }

  /**
   * Admin: kullanıcıyı kalıcı olarak sil
   * - Kendini silemez
   * - Diğer admin'leri silemez
   * - Prisma cascade ile address/order/review/subscription/wishlist vb. user FK'sı olan
   *   kayıtlar (Cascade onDelete tanımlıysa) otomatik temizlenir
   */
  async adminDeleteUser(userId: string, adminId: string) {
    if (userId === adminId) {
      throw new ForbiddenException('Kendinizi silemezsiniz');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Kullanıcı bulunamadı');

    if (user.role === 'ADMIN') {
      throw new ForbiddenException('Admin kullanıcıları silemezsiniz');
    }

    // Soft-delete: sipariş/finansal kayıtları koru, kullanıcıyı pasifleştir ve
    // kişisel verilerini anonimleştir. Hard-delete, Order/Subscription gibi
    // ilişkiler yüzünden foreign-key hatası verir ve satış geçmişini yok eder.
    await this.prisma.$transaction([
      this.prisma.refreshToken.deleteMany({ where: { userId } }),
      this.prisma.user.update({
        where: { id: userId },
        data: {
          isActive: false,
          email: `deleted+${userId}@deleted.local`,
          passwordHash: null,
          firstName: 'Silinmiş',
          lastName: 'Kullanıcı',
          phone: null,
          address: null,
          city: null,
          district: null,
          postalCode: null,
          avatar: null,
          providerId: null,
          appleId: null,
          emailVerified: false,
          marketingConsent: false,
        },
      }),
    ]);

    return { success: true, message: 'Kullanıcı silindi (pasifleştirildi ve anonimleştirildi)' };
  }
}
