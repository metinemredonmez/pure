import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class GdprService {
  constructor(private prisma: PrismaService) {}

  // ══════════════════════════════════════════════
  // VERİ DIŞA AKTARMA (Data Export)
  // KVKK Madde 11 / GDPR Article 20
  // ══════════════════════════════════════════════

  async exportUserData(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        addresses: true,
        orders: {
          include: {
            items: true,
            payment: true,
          },
        },
        subscriptions: true,
        loyaltyAccount: {
          include: {
            transactions: true,
            rewards: true,
          },
        },
        notifications: true,
        auditLogs: true,
      },
    });

    if (!user) throw new NotFoundException('Kullanıcı bulunamadı');

    // Hassas verileri temizle
    const {
      passwordHash: _passwordHash,
      mfaSecret: _mfaSecret,
      ...safeUser
    } = user;

    // Wishlist
    const wishlist = await this.prisma.wishlist.findUnique({
      where: { userId },
      include: {
        items: { include: { product: { select: { name: true, slug: true } } } },
      },
    });

    // Reviews
    const reviews = await this.prisma.review.findMany({
      where: { userId },
      include: { product: { select: { name: true, slug: true } } },
    });

    // Consent logs
    const consents = await this.prisma.consentLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return {
      exportDate: new Date().toISOString(),
      format: 'JSON',
      data: {
        profile: safeUser,
        wishlist,
        reviews,
        consents,
      },
    };
  }

  // ══════════════════════════════════════════════
  // HESAP SİLME (Right to be Forgotten)
  // KVKK Madde 11 / GDPR Article 17
  // ══════════════════════════════════════════════

  async deleteAccount(userId: string, confirmEmail: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new NotFoundException('Kullanıcı bulunamadı');

    if (user.email !== confirmEmail) {
      throw new BadRequestException('Email doğrulaması başarısız');
    }

    // Aktif abonelik kontrolü
    const activeSubscription = await this.prisma.subscription.findFirst({
      where: { userId, status: 'ACTIVE' },
    });

    if (activeSubscription) {
      throw new BadRequestException(
        'Aktif aboneliğiniz var. Önce aboneliğinizi iptal edin.',
      );
    }

    // Bekleyen sipariş kontrolü
    const pendingOrder = await this.prisma.order.findFirst({
      where: {
        userId,
        status: { in: ['PENDING', 'CONFIRMED', 'PREPARING', 'SHIPPED'] },
      },
    });

    if (pendingOrder) {
      throw new BadRequestException(
        'Teslim edilmemiş siparişiniz var. Sipariş tamamlandıktan sonra hesabınızı silebilirsiniz.',
      );
    }

    // Soft delete: Kişisel verileri anonimleştir, kaydı tut (yasal gereklilik)
    const anonymousEmail = `deleted_${crypto.randomBytes(8).toString('hex')}@anonymized.olentia.com`;

    await this.prisma.$transaction([
      // Kullanıcı verilerini anonimleştir
      this.prisma.user.update({
        where: { id: userId },
        data: {
          email: anonymousEmail,
          firstName: 'Silindi',
          lastName: 'Kullanıcı',
          phone: null,
          avatar: null,
          passwordHash: null,
          mfaSecret: null,
          mfaEnabled: false,
          isActive: false,
          providerId: null,
          companyName: null,
          taxNumber: null,
          latitude: null,
          longitude: null,
          locationLabel: null,
        },
      }),

      // Adresleri sil
      this.prisma.address.deleteMany({ where: { userId } }),

      // Refresh token'ları sil
      this.prisma.refreshToken.deleteMany({ where: { userId } }),

      // Wishlist sil
      this.prisma.wishlist.deleteMany({ where: { userId } }),

      // In-app bildirimleri sil
      this.prisma.inAppNotification.deleteMany({ where: { userId } }),

      // Loyalty hesabını anonimleştir
      this.prisma.loyaltyAccount.updateMany({
        where: { userId },
        data: {
          referralCode: `DEL_${crypto.randomBytes(4).toString('hex')}`,
          referredBy: null,
        },
      }),

      // Silme işlemini logla
      this.prisma.auditLog.create({
        data: {
          userId: null, // Kullanıcı silindi
          action: 'user.deleted',
          entity: 'User',
          entityId: userId,
          newData: {
            deletedAt: new Date(),
            reason: 'User request - GDPR/KVKK',
          },
        },
      }),
    ]);

    return {
      message: 'Hesabınız başarıyla silindi',
      deletedAt: new Date().toISOString(),
    };
  }

  // ══════════════════════════════════════════════
  // CONSENT YÖNETİMİ (İzin Kayıtları)
  // ══════════════════════════════════════════════

  async logConsent(
    userId: string | null,
    email: string,
    consentType: string,
    accepted: boolean,
    version: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    return this.prisma.consentLog.create({
      data: {
        userId,
        email,
        consentType,
        accepted,
        version,
        ipAddress,
        userAgent,
      },
    });
  }

  async getUserConsents(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!user) throw new NotFoundException('Kullanıcı bulunamadı');

    return this.prisma.consentLog.findMany({
      where: {
        OR: [{ userId }, { email: user.email }],
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateConsent(
    userId: string,
    consentType: string,
    accepted: boolean,
    version: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new NotFoundException('Kullanıcı bulunamadı');

    // Marketing consent ise user tablosunu da güncelle
    if (consentType === 'marketing') {
      await this.prisma.user.update({
        where: { id: userId },
        data: { marketingConsent: accepted },
      });
    }

    // Consent log kaydet
    return this.logConsent(
      userId,
      user.email,
      consentType,
      accepted,
      version,
      ipAddress,
      userAgent,
    );
  }

  // ══════════════════════════════════════════════
  // GİZLİLİK POLİTİKASI KABUL
  // ══════════════════════════════════════════════

  async acceptPrivacyPolicy(
    userId: string,
    version: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new NotFoundException('Kullanıcı bulunamadı');

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { privacyAccepted: true },
      }),
      this.prisma.consentLog.create({
        data: {
          userId,
          email: user.email,
          consentType: 'privacy',
          accepted: true,
          version,
          ipAddress,
          userAgent,
        },
      }),
    ]);

    return { message: 'Gizlilik politikası kabul edildi', version };
  }

  // ══════════════════════════════════════════════
  // ÇEREZ YÖNETİMİ
  // ══════════════════════════════════════════════

  async updateCookieConsent(
    userId: string | null,
    email: string | null,
    preferences: {
      necessary: boolean; // Her zaman true
      analytics: boolean;
      marketing: boolean;
      preferences: boolean;
    },
    ipAddress?: string,
    userAgent?: string,
  ) {
    const version = '1.0';

    // Her kategori için ayrı log
    const logs: Prisma.PrismaPromise<any>[] = [];

    if (userId || email) {
      const userEmail =
        email ||
        (
          await this.prisma.user.findUnique({
            where: { id: userId! },
            select: { email: true },
          })
        )?.email;

      if (userEmail) {
        for (const [type, accepted] of Object.entries(preferences)) {
          if (type !== 'necessary') {
            logs.push(
              this.prisma.consentLog.create({
                data: {
                  userId,
                  email: userEmail,
                  consentType: `cookies_${type}`,
                  accepted,
                  version,
                  ipAddress,
                  userAgent,
                },
              }),
            );
          }
        }

        await this.prisma.$transaction(logs);
      }
    }

    return {
      message: 'Çerez tercihleri kaydedildi',
      preferences,
    };
  }
}
