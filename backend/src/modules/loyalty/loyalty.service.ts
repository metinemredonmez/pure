import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LoyaltyTier, PointTransactionType } from '@prisma/client';
import { randomBytes } from 'crypto';

// ── Puan Konfigürasyonu (varsayılan) ──
const DEFAULT_CONFIG = {
  // Puan kazanım
  POINTS_PER_TL: 1, // Her 1 TL = 1 puan
  SUBSCRIPTION_BONUS_MULTIPLIER: 1.5, // Aboneler %50 fazla puan
  REVIEW_POINTS: 25, // Yorum yapma = 25 puan
  REFERRAL_POINTS: 100, // Arkadaş davet = 100 puan
  REFERRAL_FRIEND_POINTS: 50, // Davet edilen de 50 puan
  BIRTHDAY_POINTS: 200, // Doğum günü hediyesi
  FIRST_ORDER_BONUS: 50, // İlk sipariş bonusu
  SIGNUP_BONUS: 25, // Kayıt bonusu

  // Milestone: Her X siparişte ücretsiz kahve
  MILESTONE_EVERY_N_ORDERS: 10, // Her 10 siparişte
  MILESTONE_BONUS_POINTS: 500, // 500 puan bonus

  // Harcama
  POINTS_TO_TL_RATE: 10, // 10 puan = 1 TL indirim
  MIN_REDEEM_POINTS: 100, // Minimum 100 puan kullanım

  // Puan süresi
  POINT_EXPIRY_DAYS: 365, // 1 yıl geçerlilik

  // Tier eşikleri (toplam kazanılan puana göre)
  TIER_SILVER: 500,
  TIER_GOLD: 1500,
  TIER_PLATINUM: 4000,

  // Tier bonus çarpanları
  TIER_BRONZE_MULTIPLIER: 1.0,
  TIER_SILVER_MULTIPLIER: 1.2, // Silver %20 fazla puan
  TIER_GOLD_MULTIPLIER: 1.5, // Gold %50 fazla puan
  TIER_PLATINUM_MULTIPLIER: 2.0, // Platinum 2x puan
};

@Injectable()
export class LoyaltyService {
  private readonly logger = new Logger(LoyaltyService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Get effective config (DB overrides DEFAULT_CONFIG)
   */
  private async getEffectiveConfig(): Promise<typeof DEFAULT_CONFIG> {
    const dbConfig = await this.prisma.loyaltyConfig.findMany();
    if (dbConfig.length === 0) return DEFAULT_CONFIG;

    const overrides: Record<string, any> = {};
    dbConfig.forEach((c) => {
      const num = Number(c.value);
      overrides[c.key] = isNaN(num) ? c.value : num;
    });
    return { ...DEFAULT_CONFIG, ...overrides };
  }

  // ============================================
  // HESAP YÖNETİMİ
  // ============================================

  /**
   * Kullanıcı kayıt olduğunda loyalty hesabı oluştur
   */
  async createAccount(userId: string, referralCode?: string): Promise<any> {
    const existing = await this.prisma.loyaltyAccount.findUnique({
      where: { userId },
    });
    if (existing) return existing;

    const myReferralCode = this.generateReferralCode();

    const account = await this.prisma.loyaltyAccount.create({
      data: {
        userId,
        referralCode: myReferralCode,
        referredBy: referralCode || null,
      },
    });

    const config = await this.getEffectiveConfig();

    // Kayıt bonusu
    await this.addPoints(
      account.id,
      config.SIGNUP_BONUS,
      PointTransactionType.EARN_SIGNUP,
      "Olentia Pure'a hoş geldin bonusu",
    );

    // Referral puanları
    if (referralCode) {
      const referrer = await this.prisma.loyaltyAccount.findUnique({
        where: { referralCode },
      });
      if (referrer) {
        await this.addPoints(
          referrer.id,
          config.REFERRAL_POINTS,
          PointTransactionType.EARN_REFERRAL,
          'Arkadaş davet puanı',
        );
        await this.addPoints(
          account.id,
          config.REFERRAL_FRIEND_POINTS,
          PointTransactionType.EARN_REFERRAL,
          'Davet bonusu — hoş geldin!',
        );
      }
    }

    this.logger.log(`Loyalty account created for user ${userId}`);
    return this.getAccount(userId);
  }

  /**
   * Kullanıcının loyalty hesabını getir
   */
  async getAccount(userId: string) {
    const account = await this.prisma.loyaltyAccount.findUnique({
      where: { userId },
      include: {
        _count: { select: { transactions: true, rewards: true } },
      },
    });

    if (!account) {
      throw new NotFoundException('Loyalty hesabı bulunamadı');
    }

    const config = await this.getEffectiveConfig();

    const nextTier = this.getNextTier(account.tier);
    const nextTierPoints = this.getNextTierThreshold(account.tier, config);
    const progressToNextTier = nextTierPoints
      ? Math.min(100, Math.round((account.totalPoints / nextTierPoints) * 100))
      : 100;

    // Sonraki ücretsiz kahveye kaç sipariş kaldı
    const ordersToNextFree =
      config.MILESTONE_EVERY_N_ORDERS -
      (account.totalOrders % config.MILESTONE_EVERY_N_ORDERS);

    const pendingFreeRewards =
      account.freeRewardsEarned - account.freeRewardsClaimed;

    return {
      ...account,
      tierMultiplier: this.getTierMultiplier(account.tier, config),
      nextTier,
      nextTierPoints,
      progressToNextTier,
      ordersToNextFree,
      pendingFreeRewards,
      pointsValueTL: (
        account.availablePoints / config.POINTS_TO_TL_RATE
      ).toFixed(2),
    };
  }

  // ============================================
  // PUAN KAZANIMI
  // ============================================

  /**
   * Sipariş tamamlandığında puan kazan
   */
  async earnFromOrder(
    userId: string,
    orderId: string,
    orderTotal: number,
    isSubscription: boolean = false,
  ) {
    const account = await this.ensureAccount(userId);
    const config = await this.getEffectiveConfig();

    // Tier çarpanı
    const tierMultiplier = this.getTierMultiplier(account.tier, config);

    // Abonelik çarpanı
    const subscriptionMultiplier = isSubscription
      ? config.SUBSCRIPTION_BONUS_MULTIPLIER
      : 1;

    // Puan hesapla: TL * puan oranı * tier çarpanı * abonelik çarpanı
    const basePoints = Math.floor(orderTotal * config.POINTS_PER_TL);
    const finalPoints = Math.floor(
      basePoints * tierMultiplier * subscriptionMultiplier,
    );

    const description = isSubscription
      ? `Abonelik sipariş puanı (${tierMultiplier}x tier + ${subscriptionMultiplier}x abo bonus)`
      : `Sipariş puanı (${tierMultiplier}x ${account.tier} tier)`;

    await this.addPoints(
      account.id,
      finalPoints,
      isSubscription
        ? PointTransactionType.EARN_SUBSCRIPTION
        : PointTransactionType.EARN_ORDER,
      description,
      orderId,
    );

    // Sipariş sayısını güncelle
    const newTotalOrders = account.totalOrders + 1;
    await this.prisma.loyaltyAccount.update({
      where: { id: account.id },
      data: {
        totalOrders: newTotalOrders,
        lastActivityAt: new Date(),
      },
    });

    // İlk sipariş bonusu
    if (newTotalOrders === 1) {
      await this.addPoints(
        account.id,
        config.FIRST_ORDER_BONUS,
        PointTransactionType.EARN_FIRST_ORDER,
        'İlk sipariş tebrik bonusu! 🎉',
        orderId,
      );
    }

    // Milestone kontrolü: Her N siparişte ücretsiz kahve
    if (newTotalOrders % config.MILESTONE_EVERY_N_ORDERS === 0) {
      await this.addPoints(
        account.id,
        config.MILESTONE_BONUS_POINTS,
        PointTransactionType.EARN_MILESTONE,
        `🎁 ${newTotalOrders}. sipariş milestone bonusu — Ücretsiz kahve kazandın!`,
        orderId,
      );

      // Ücretsiz kahve ödülü oluştur
      await this.createFreeReward(account.id, newTotalOrders);
    }

    // Tier güncelle
    await this.updateTier(account.id);

    this.logger.log(
      `User ${userId} earned ${finalPoints} points from order ${orderId} (total orders: ${newTotalOrders})`,
    );

    return {
      pointsEarned: finalPoints,
      totalOrders: newTotalOrders,
      isMilestone: newTotalOrders % config.MILESTONE_EVERY_N_ORDERS === 0,
      milestoneReward:
        newTotalOrders % config.MILESTONE_EVERY_N_ORDERS === 0
          ? 'Ücretsiz kahve kazandınız! 🎉'
          : null,
      ordersToNextFree:
        config.MILESTONE_EVERY_N_ORDERS -
        (newTotalOrders % config.MILESTONE_EVERY_N_ORDERS),
    };
  }

  /**
   * Yorum yapma puanı
   */
  async earnFromReview(userId: string, productName: string) {
    const account = await this.ensureAccount(userId);
    const config = await this.getEffectiveConfig();
    await this.addPoints(
      account.id,
      config.REVIEW_POINTS,
      PointTransactionType.EARN_REVIEW,
      `"${productName}" için yorum puanı`,
    );
    return { pointsEarned: config.REVIEW_POINTS };
  }

  /**
   * Doğum günü hediye puanı
   */
  async earnBirthdayBonus(userId: string) {
    const account = await this.ensureAccount(userId);
    const config = await this.getEffectiveConfig();
    await this.addPoints(
      account.id,
      config.BIRTHDAY_POINTS,
      PointTransactionType.EARN_BIRTHDAY,
      'Doğum günün kutlu olsun! 🎂 Hediye puanın burada.',
    );
    return { pointsEarned: config.BIRTHDAY_POINTS };
  }

  // ============================================
  // PUAN HARCAMA / ÖDÜLLER
  // ============================================

  /**
   * Puan ile indirim oluştur (checkout'ta kullanılır)
   */
  async redeemForDiscount(userId: string, points: number): Promise<any> {
    const account = await this.ensureAccount(userId);

    const config = await this.getEffectiveConfig();

    if (points < config.MIN_REDEEM_POINTS) {
      throw new BadRequestException(
        `Minimum ${config.MIN_REDEEM_POINTS} puan kullanılmalıdır`,
      );
    }

    if (points > account.availablePoints) {
      throw new BadRequestException(
        `Yetersiz puan. Kullanılabilir: ${account.availablePoints}`,
      );
    }

    const discountTL = points / config.POINTS_TO_TL_RATE;
    const code = `LP-${this.generateShortCode()}`;

    // Puanı düş
    await this.spendPoints(
      account.id,
      points,
      PointTransactionType.SPEND_DISCOUNT,
      `₺${discountTL.toFixed(2)} indirim kuponu oluşturuldu (${code})`,
    );

    // Ödül kaydı
    const reward = await this.prisma.loyaltyReward.create({
      data: {
        loyaltyAccountId: account.id,
        name: `₺${discountTL.toFixed(2)} Puan İndirimi`,
        type: 'discount_amount',
        value: discountTL,
        pointsCost: points,
        code,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 gün
      },
    });

    return {
      reward,
      discountTL,
      code,
      message: `${points} puan ile ₺${discountTL.toFixed(2)} indirim kuponu oluşturuldu`,
    };
  }

  /**
   * Ücretsiz kahve ödülünü kullan
   */
  async claimFreeReward(userId: string, rewardId: string) {
    const account = await this.ensureAccount(userId);

    const reward = await this.prisma.loyaltyReward.findFirst({
      where: {
        id: rewardId,
        loyaltyAccountId: account.id,
        type: 'free_coffee',
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!reward) {
      throw new NotFoundException('Geçerli ücretsiz kahve ödülü bulunamadı');
    }

    await this.prisma.loyaltyReward.update({
      where: { id: reward.id },
      data: { isUsed: true, usedAt: new Date() },
    });

    await this.prisma.loyaltyAccount.update({
      where: { id: account.id },
      data: { freeRewardsClaimed: { increment: 1 } },
    });

    return { message: 'Ücretsiz kahve ödülünüz kullanıldı! ☕', reward };
  }

  /**
   * Kullanıcının ödüllerini listele
   */
  async getRewards(userId: string, onlyAvailable: boolean = false) {
    const account = await this.ensureAccount(userId);

    const where: any = { loyaltyAccountId: account.id };
    if (onlyAvailable) {
      where.isUsed = false;
      where.expiresAt = { gt: new Date() };
    }

    return this.prisma.loyaltyReward.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Puan geçmişi
   */
  async getTransactionHistory(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ) {
    const account = await this.ensureAccount(userId);

    const [transactions, total] = await Promise.all([
      this.prisma.pointTransaction.findMany({
        where: { loyaltyAccountId: account.id },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.pointTransaction.count({
        where: { loyaltyAccountId: account.id },
      }),
    ]);

    return {
      data: transactions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ============================================
  // TEKRAR SATIN ALMA ANALİZİ
  // ============================================

  /**
   * Kullanıcının tekrar satın alma analizi
   */
  async getRepurchaseAnalysis(userId: string) {
    const orders = await this.prisma.order.findMany({
      where: { userId, status: 'DELIVERED' },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, slug: true } },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    if (orders.length === 0) {
      return { totalOrders: 0, repeatProducts: [], avgDaysBetweenOrders: null };
    }

    // Ürün bazlı tekrar alım
    const productCounts: Record<
      string,
      { name: string; slug: string; count: number; lastOrder: Date }
    > = {};

    for (const order of orders) {
      for (const item of order.items) {
        // Ürün silinmiş olabilir → productId null. Snapshot productName ile devam et.
        const pid = item.productId || `deleted:${item.productName}`;
        if (!productCounts[pid]) {
          productCounts[pid] = {
            name: item.product?.name || item.productName,
            slug: item.product?.slug || '',
            count: 0,
            lastOrder: order.createdAt,
          };
        }
        productCounts[pid].count++;
        productCounts[pid].lastOrder = order.createdAt;
      }
    }

    // 2+ kez alınmış ürünler (tekrar satın alma)
    const repeatProducts = Object.values(productCounts)
      .filter((p) => p.count >= 2)
      .sort((a, b) => b.count - a.count);

    // Ortalama sipariş aralığı (gün)
    let avgDaysBetween: number | null = null;
    if (orders.length >= 2) {
      const dayDiffs: number[] = [];
      for (let i = 1; i < orders.length; i++) {
        const diff =
          (orders[i].createdAt.getTime() - orders[i - 1].createdAt.getTime()) /
          (1000 * 60 * 60 * 24);
        dayDiffs.push(diff);
      }
      avgDaysBetween = Math.round(
        dayDiffs.reduce((a, b) => a + b, 0) / dayDiffs.length,
      );
    }

    return {
      totalOrders: orders.length,
      repeatProducts,
      repeatRate:
        orders.length > 0
          ? Math.round(
              (repeatProducts.length / Object.keys(productCounts).length) * 100,
            )
          : 0,
      avgDaysBetweenOrders: avgDaysBetween,
      customerValue: {
        lifetimeSpend: orders.reduce((sum, o) => sum + Number(o.total), 0),
        avgOrderValue: Math.round(
          orders.reduce((sum, o) => sum + Number(o.total), 0) / orders.length,
        ),
      },
    };
  }

  // ============================================
  // ADMIN
  // ============================================

  /**
   * Loyalty istatistikleri
   */
  async getStats() {
    const [
      totalAccounts,
      tierDistribution,
      totalPointsIssued,
      totalPointsSpent,
    ] = await Promise.all([
      this.prisma.loyaltyAccount.count(),
      this.prisma.loyaltyAccount.groupBy({
        by: ['tier'],
        _count: true,
      }),
      this.prisma.loyaltyAccount.aggregate({
        _sum: { totalPoints: true, spentPoints: true, expiredPoints: true },
      }),
      this.prisma.loyaltyReward.count({ where: { isUsed: true } }),
    ]);

    const activeAccounts = await this.prisma.loyaltyAccount.count({
      where: {
        lastActivityAt: {
          gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        },
      },
    });

    // Milestone'a ulaşanlar
    const milestoneUsers = await this.prisma.loyaltyAccount.count({
      where: { freeRewardsEarned: { gt: 0 } },
    });

    return {
      totalAccounts,
      activeAccounts,
      tierDistribution: tierDistribution.map((t) => ({
        tier: t.tier,
        count: t._count,
      })),
      points: {
        totalIssued: totalPointsIssued._sum.totalPoints || 0,
        totalSpent: totalPointsIssued._sum.spentPoints || 0,
        totalExpired: totalPointsIssued._sum.expiredPoints || 0,
      },
      rewards: {
        totalRedeemed: totalPointsSpent,
        milestoneUsers,
      },
    };
  }

  /**
   * Admin: Kullanıcıya manuel puan ekle/çıkar
   */
  async adminAdjustPoints(userId: string, points: number, reason: string) {
    const account = await this.ensureAccount(userId);

    if (points > 0) {
      await this.addPoints(
        account.id,
        points,
        PointTransactionType.ADMIN_ADJUST,
        `Admin puanı: ${reason}`,
      );
    } else {
      await this.spendPoints(
        account.id,
        Math.abs(points),
        PointTransactionType.ADMIN_ADJUST,
        `Admin düzeltmesi: ${reason}`,
      );
    }

    return this.getAccount(userId);
  }

  /**
   * Admin: Loyalty config güncelle
   */
  async updateConfig(key: string, value: string, description?: string) {
    return this.prisma.loyaltyConfig.upsert({
      where: { key },
      update: { value, description },
      create: { key, value, description },
    });
  }

  async getConfig() {
    const dbConfig = await this.prisma.loyaltyConfig.findMany();
    const configMap: Record<string, string> = {};
    dbConfig.forEach((c) => {
      configMap[c.key] = c.value;
    });
    return { ...DEFAULT_CONFIG, ...configMap };
  }

  /**
   * Admin: En sadık müşteriler leaderboard
   */
  async getLeaderboard(limit: number = 20) {
    return this.prisma.loyaltyAccount.findMany({
      orderBy: { totalPoints: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
      },
    });
  }

  // ============================================
  // PRIVATE HELPERS
  // ============================================

  private async ensureAccount(userId: string) {
    let account = await this.prisma.loyaltyAccount.findUnique({
      where: { userId },
    });
    if (!account) {
      account = await this.prisma.loyaltyAccount.create({
        data: {
          userId,
          referralCode: this.generateReferralCode(),
        },
      });
    }
    return account;
  }

  private async addPoints(
    accountId: string,
    points: number,
    type: PointTransactionType,
    description: string,
    orderId?: string,
  ) {
    const config = await this.getEffectiveConfig();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + config.POINT_EXPIRY_DAYS);

    await this.prisma.$transaction([
      this.prisma.pointTransaction.create({
        data: {
          loyaltyAccountId: accountId,
          type,
          points,
          description,
          orderId,
          expiresAt,
        },
      }),
      this.prisma.loyaltyAccount.update({
        where: { id: accountId },
        data: {
          totalPoints: { increment: points },
          availablePoints: { increment: points },
          lastActivityAt: new Date(),
        },
      }),
    ]);
  }

  private async spendPoints(
    accountId: string,
    points: number,
    type: PointTransactionType,
    description: string,
  ) {
    await this.prisma.$transaction([
      this.prisma.pointTransaction.create({
        data: {
          loyaltyAccountId: accountId,
          type,
          points: -points,
          description,
        },
      }),
      this.prisma.loyaltyAccount.update({
        where: { id: accountId },
        data: {
          availablePoints: { decrement: points },
          spentPoints: { increment: points },
          lastActivityAt: new Date(),
        },
      }),
    ]);
  }

  private async createFreeReward(accountId: string, milestoneOrder: number) {
    const code = `FREE-${this.generateShortCode()}`;

    await this.prisma.loyaltyReward.create({
      data: {
        loyaltyAccountId: accountId,
        name: `Ücretsiz Kahve — ${milestoneOrder}. sipariş ödülü`,
        type: 'free_coffee',
        value: 0,
        pointsCost: 0,
        code,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 gün geçerli
      },
    });

    await this.prisma.loyaltyAccount.update({
      where: { id: accountId },
      data: { freeRewardsEarned: { increment: 1 } },
    });
  }

  private async updateTier(accountId: string) {
    const account = await this.prisma.loyaltyAccount.findUnique({
      where: { id: accountId },
    });
    if (!account) return;

    const config = await this.getEffectiveConfig();

    let newTier: LoyaltyTier;
    if (account.totalPoints >= config.TIER_PLATINUM) {
      newTier = LoyaltyTier.PLATINUM;
    } else if (account.totalPoints >= config.TIER_GOLD) {
      newTier = LoyaltyTier.GOLD;
    } else if (account.totalPoints >= config.TIER_SILVER) {
      newTier = LoyaltyTier.SILVER;
    } else {
      newTier = LoyaltyTier.BRONZE;
    }

    if (newTier !== account.tier) {
      await this.prisma.loyaltyAccount.update({
        where: { id: accountId },
        data: { tier: newTier },
      });
      this.logger.log(`User tier upgraded: ${account.tier} → ${newTier}`);
    }
  }

  private getTierMultiplier(
    tier: LoyaltyTier,
    config = DEFAULT_CONFIG,
  ): number {
    switch (tier) {
      case LoyaltyTier.PLATINUM:
        return config.TIER_PLATINUM_MULTIPLIER;
      case LoyaltyTier.GOLD:
        return config.TIER_GOLD_MULTIPLIER;
      case LoyaltyTier.SILVER:
        return config.TIER_SILVER_MULTIPLIER;
      default:
        return config.TIER_BRONZE_MULTIPLIER;
    }
  }

  private getNextTier(tier: LoyaltyTier): string | null {
    switch (tier) {
      case LoyaltyTier.BRONZE:
        return 'SILVER';
      case LoyaltyTier.SILVER:
        return 'GOLD';
      case LoyaltyTier.GOLD:
        return 'PLATINUM';
      default:
        return null;
    }
  }

  private getNextTierThreshold(
    tier: LoyaltyTier,
    config = DEFAULT_CONFIG,
  ): number | null {
    switch (tier) {
      case LoyaltyTier.BRONZE:
        return config.TIER_SILVER;
      case LoyaltyTier.SILVER:
        return config.TIER_GOLD;
      case LoyaltyTier.GOLD:
        return config.TIER_PLATINUM;
      default:
        return null;
    }
  }

  private generateReferralCode(): string {
    return 'OLP-' + randomBytes(4).toString('hex').toUpperCase();
  }

  private generateShortCode(): string {
    return randomBytes(3).toString('hex').toUpperCase();
  }
}
