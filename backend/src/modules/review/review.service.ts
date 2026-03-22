import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class ReviewService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  // ══════════════════════════════════════════════
  // PUBLIC: Ürün Yorumları
  // ══════════════════════════════════════════════

  async getProductReviews(productId: string, page = 1, limit = 10) {
    const where = {
      productId,
      isPublished: true,
      isApproved: true,
    };

    const [reviews, total, stats] = await Promise.all([
      this.prisma.review.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          rating: true,
          title: true,
          comment: true,
          images: true,
          isVerified: true,
          helpfulCount: true,
          createdAt: true,
        },
      }),
      this.prisma.review.count({ where }),
      this.getProductReviewStats(productId),
    ]);

    return {
      data: reviews,
      stats,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getProductReviewStats(productId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { productId, isPublished: true, isApproved: true },
      select: { rating: true },
    });

    const total = reviews.length;
    if (total === 0) {
      return {
        avgRating: 0,
        totalReviews: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }

    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const avgRating = Math.round((sum / total) * 10) / 10;

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((r) => {
      distribution[r.rating as keyof typeof distribution]++;
    });

    return { avgRating, totalReviews: total, distribution };
  }

  // ══════════════════════════════════════════════
  // USER: Yorum Yazma
  // ══════════════════════════════════════════════

  async createReview(
    userId: string,
    productId: string,
    data: {
      rating: number;
      title?: string;
      comment?: string;
      images?: string[];
      orderId?: string;
    },
  ) {
    // Ürün kontrolü
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException('Ürün bulunamadı');

    // Kullanıcı bu ürüne zaten yorum yapmış mı?
    const existing = await this.prisma.review.findUnique({
      where: { productId_userId: { productId, userId } },
    });
    if (existing) {
      throw new BadRequestException('Bu ürüne zaten yorum yapmışsınız');
    }

    // Rating kontrolü
    if (data.rating < 1 || data.rating > 5) {
      throw new BadRequestException('Puan 1-5 arasında olmalı');
    }

    // Satın almış mı kontrolü (doğrulanmış yorum için)
    let isVerified = false;
    if (data.orderId) {
      const order = await this.prisma.order.findFirst({
        where: {
          id: data.orderId,
          userId,
          items: { some: { productId } },
          status: 'DELIVERED',
        },
      });
      isVerified = !!order;
    } else {
      // orderId verilmemişse, herhangi bir teslim edilmiş siparişi kontrol et
      const hasOrder = await this.prisma.order.findFirst({
        where: {
          userId,
          items: { some: { productId } },
          status: 'DELIVERED',
        },
      });
      isVerified = !!hasOrder;
    }

    // Yorum oluştur + loyalty puanı ekle — tek transaction
    const review = await this.prisma.$transaction(async (tx) => {
      const newReview = await tx.review.create({
        data: {
          productId,
          userId,
          orderId: data.orderId,
          rating: data.rating,
          title: data.title,
          comment: data.comment,
          images: data.images || [],
          isVerified,
          isApproved: true,
          isPublished: true,
        },
      });

      // Ürün ortalama puanını güncelle
      const reviews = await tx.review.findMany({
        where: { productId, isPublished: true, isApproved: true },
        select: { rating: true },
      });
      const total = reviews.length;
      const avgRating =
        total > 0
          ? Math.round(
              (reviews.reduce((acc, r) => acc + r.rating, 0) / total) * 10,
            ) / 10
          : 0;
      await tx.product.update({
        where: { id: productId },
        data: { avgRating, reviewCount: total },
      });

      // Loyalty puanı ekle
      const loyaltyAccount = await tx.loyaltyAccount.findUnique({
        where: { userId },
      });
      if (loyaltyAccount) {
        await tx.pointTransaction.create({
          data: {
            loyaltyAccountId: loyaltyAccount.id,
            type: 'EARN_REVIEW',
            points: 25,
            description: `Ürün yorumu: ${product.name}`,
          },
        });
        await tx.loyaltyAccount.update({
          where: { id: loyaltyAccount.id },
          data: {
            totalPoints: { increment: 25 },
            availablePoints: { increment: 25 },
          },
        });
      }

      return newReview;
    });

    return review;
  }

  async updateReview(
    userId: string,
    reviewId: string,
    data: {
      rating?: number;
      title?: string;
      comment?: string;
      images?: string[];
    },
  ) {
    const review = await this.prisma.review.findFirst({
      where: { id: reviewId, userId },
    });

    if (!review) throw new NotFoundException('Yorum bulunamadı');

    if (data.rating && (data.rating < 1 || data.rating > 5)) {
      throw new BadRequestException('Puan 1-5 arasında olmalı');
    }

    const updated = await this.prisma.review.update({
      where: { id: reviewId },
      data: {
        ...data,
        isApproved: true, // Düzenlenen yorum tekrar onaya gidebilir: false yapın
      },
    });

    // Ürün ortalama puanını güncelle
    await this.updateProductRating(review.productId);

    return updated;
  }

  async deleteReview(userId: string, reviewId: string) {
    const review = await this.prisma.review.findFirst({
      where: { id: reviewId, userId },
    });

    if (!review) throw new NotFoundException('Yorum bulunamadı');

    await this.prisma.review.delete({ where: { id: reviewId } });

    // Ürün ortalama puanını güncelle
    await this.updateProductRating(review.productId);

    return { message: 'Yorum silindi' };
  }

  async getUserReviews(userId: string) {
    return this.prisma.review.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            images: { take: 1 },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markReviewHelpful(reviewId: string, userId: string) {
    // Check if user already voted
    const existing = await this.prisma.reviewHelpful.findUnique({
      where: { reviewId_userId: { reviewId, userId } },
    });
    if (existing) {
      throw new BadRequestException('Bu yorumu zaten faydalı olarak işaretlediniz');
    }

    // Create vote + increment count in transaction
    await this.prisma.$transaction([
      this.prisma.reviewHelpful.create({
        data: { reviewId, userId },
      }),
      this.prisma.review.update({
        where: { id: reviewId },
        data: { helpfulCount: { increment: 1 } },
      }),
    ]);

    return { message: 'Yorum faydalı olarak işaretlendi' };
  }

  async reportReview(reviewId: string, _userId: string, _reason?: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) throw new NotFoundException('Yorum bulunamadı');

    // Report count artır, belirli bir sayıya ulaşınca otomatik gizle
    await this.prisma.review.update({
      where: { id: reviewId },
      data: {
        reportCount: { increment: 1 },
        isPublished: review.reportCount >= 4 ? false : review.isPublished,
      },
    });

    return { message: 'Yorum raporlandı' };
  }

  // ══════════════════════════════════════════════
  // ADMIN: Yorum Yönetimi
  // ══════════════════════════════════════════════

  async adminGetReviews(filters: {
    page?: number;
    limit?: number;
    isApproved?: boolean;
    isPublished?: boolean;
    productId?: string;
  }) {
    const {
      page = 1,
      limit = 20,
      isApproved,
      isPublished,
      productId,
    } = filters;

    const where: any = {};
    if (isApproved !== undefined) where.isApproved = isApproved;
    if (isPublished !== undefined) where.isPublished = isPublished;
    if (productId) where.productId = productId;

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        include: {
          product: { select: { id: true, name: true, slug: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.review.count({ where }),
    ]);

    return {
      data: reviews,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async adminApproveReview(
    reviewId: string,
    approve: boolean,
    adminNote?: string,
  ) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) throw new NotFoundException('Yorum bulunamadı');

    const updated = await this.prisma.review.update({
      where: { id: reviewId },
      data: {
        isApproved: approve,
        isPublished: approve,
        adminNote,
      },
    });

    // Ürün ortalama puanını güncelle
    await this.updateProductRating(review.productId);

    return updated;
  }

  async adminDeleteReview(reviewId: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) throw new NotFoundException('Yorum bulunamadı');

    await this.prisma.review.delete({ where: { id: reviewId } });
    await this.updateProductRating(review.productId);

    return { message: 'Yorum silindi' };
  }

  // ══════════════════════════════════════════════
  // HELPER: Ürün Ortalama Puanı Güncelle
  // ══════════════════════════════════════════════

  private async updateProductRating(productId: string) {
    const stats = await this.getProductReviewStats(productId);

    await this.prisma.product.update({
      where: { id: productId },
      data: {
        avgRating: stats.avgRating,
        reviewCount: stats.totalReviews,
      },
    });
  }
}
