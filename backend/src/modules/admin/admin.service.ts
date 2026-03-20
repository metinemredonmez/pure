import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // ══════════════════════════════════════════════
  // DASHBOARD KPIs
  // ══════════════════════════════════════════════

  async getDashboardStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfLastMonth = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      1,
    );
    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

    const [
      // Bugünkü metrikler
      todayOrders,
      todayRevenue,
      todayNewCustomers,

      // Bu ayki metrikler
      monthOrders,
      monthRevenue,
      monthNewCustomers,

      // Geçen ay (karşılaştırma)
      lastMonthOrders,
      lastMonthRevenue,

      // Toplam metrikler
      totalCustomers,
      totalProducts,
      activeSubscriptions,
      pendingOrders,
      lowStockProducts,
    ] = await Promise.all([
      // Bugün
      this.prisma.order.count({
        where: { createdAt: { gte: today } },
      }),
      this.prisma.order.aggregate({
        where: { createdAt: { gte: today }, status: { not: 'CANCELLED' } },
        _sum: { total: true },
      }),
      this.prisma.user.count({
        where: { createdAt: { gte: today }, role: 'CUSTOMER' },
      }),

      // Bu ay
      this.prisma.order.count({
        where: { createdAt: { gte: startOfMonth } },
      }),
      this.prisma.order.aggregate({
        where: {
          createdAt: { gte: startOfMonth },
          status: { not: 'CANCELLED' },
        },
        _sum: { total: true },
      }),
      this.prisma.user.count({
        where: { createdAt: { gte: startOfMonth }, role: 'CUSTOMER' },
      }),

      // Geçen ay
      this.prisma.order.count({
        where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
      }),
      this.prisma.order.aggregate({
        where: {
          createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
          status: { not: 'CANCELLED' },
        },
        _sum: { total: true },
      }),

      // Toplamlar
      this.prisma.user.count({ where: { role: 'CUSTOMER' } }),
      this.prisma.product.count({ where: { status: 'ACTIVE' } }),
      this.prisma.subscription.count({ where: { status: 'ACTIVE' } }),
      this.prisma.order.count({ where: { status: 'PENDING' } }),
      // Low stock: products where stock <= lowStockThreshold (using raw query for cross-column compare)
      this.prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*)::int as count FROM "Product"
        WHERE status = 'ACTIVE' AND stock <= "lowStockThreshold"
      `.then((r) => Number(r[0]?.count || 0)),
    ]);

    // Değişim oranları hesapla
    const lastMonthRevenueValue = Number(lastMonthRevenue._sum.total) || 0;
    const monthRevenueValue = Number(monthRevenue._sum.total) || 0;
    const revenueGrowth =
      lastMonthRevenueValue > 0
        ? ((monthRevenueValue - lastMonthRevenueValue) /
            lastMonthRevenueValue) *
          100
        : 0;

    const orderGrowth =
      lastMonthOrders > 0
        ? ((monthOrders - lastMonthOrders) / lastMonthOrders) * 100
        : 0;

    return {
      today: {
        orders: todayOrders,
        revenue: Number(todayRevenue._sum.total) || 0,
        newCustomers: todayNewCustomers,
      },
      month: {
        orders: monthOrders,
        revenue: monthRevenueValue,
        newCustomers: monthNewCustomers,
        revenueGrowth: Math.round(revenueGrowth * 10) / 10,
        orderGrowth: Math.round(orderGrowth * 10) / 10,
      },
      totals: {
        customers: totalCustomers,
        products: totalProducts,
        activeSubscriptions,
        pendingOrders,
        lowStockProducts,
      },
    };
  }

  // ══════════════════════════════════════════════
  // REVENUE CHART DATA
  // ══════════════════════════════════════════════

  async getRevenueChart(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: { gte: startDate },
        status: { not: 'CANCELLED' },
      },
      select: {
        total: true,
        createdAt: true,
      },
    });

    // Günlük grupla
    const dailyData: Record<string, { revenue: number; orders: number }> = {};
    orders.forEach((order) => {
      const date = order.createdAt.toISOString().split('T')[0];
      if (!dailyData[date]) {
        dailyData[date] = { revenue: 0, orders: 0 };
      }
      dailyData[date].revenue += Number(order.total);
      dailyData[date].orders++;
    });

    // Tüm günleri doldur
    const result: { date: string; revenue: number; orders: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      result.push({
        date: dateStr,
        revenue: dailyData[dateStr]?.revenue || 0,
        orders: dailyData[dateStr]?.orders || 0,
      });
    }

    return result;
  }

  // ══════════════════════════════════════════════
  // TOP PRODUCTS
  // ══════════════════════════════════════════════

  async getTopProducts(limit = 10, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const orderItems = await this.prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: {
          createdAt: { gte: startDate },
          status: { not: 'CANCELLED' },
        },
      },
      _sum: { quantity: true, totalPrice: true },
      orderBy: { _sum: { totalPrice: 'desc' } },
      take: limit,
    });

    const productIds = orderItems.map((item) => item.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, slug: true, images: { take: 1 } },
    });

    return orderItems.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      return {
        product: product || { id: item.productId, name: 'Unknown' },
        totalQuantity: item._sum.quantity,
        totalRevenue: Number(item._sum.totalPrice),
      };
    });
  }

  // ══════════════════════════════════════════════
  // RECENT ORDERS
  // ══════════════════════════════════════════════

  async getRecentOrders(limit = 10) {
    return this.prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        orderNumber: true,
        total: true,
        status: true,
        createdAt: true,
        user: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
    });
  }

  // ══════════════════════════════════════════════
  // CUSTOMER INSIGHTS
  // ══════════════════════════════════════════════

  async getCustomerInsights() {
    const [
      totalCustomers,
      verifiedCustomers,
      withOrders,
      repeatCustomers,
      avgOrderValue,
      topCustomers,
    ] = await Promise.all([
      this.prisma.user.count({ where: { role: 'CUSTOMER' } }),
      this.prisma.user.count({
        where: { role: 'CUSTOMER', emailVerified: true },
      }),
      this.prisma.user.count({
        where: { role: 'CUSTOMER', orders: { some: {} } },
      }),
      // 2+ sipariş veren müşteriler
      this.prisma.user
        .count({
          where: {
            role: 'CUSTOMER',
            orders: { some: {} },
          },
        })
        .then(async () => {
          const users = await this.prisma.user.findMany({
            where: { role: 'CUSTOMER' },
            select: { id: true, _count: { select: { orders: true } } },
          });
          return users.filter((u) => u._count.orders >= 2).length;
        }),
      this.prisma.order.aggregate({
        where: { status: { not: 'CANCELLED' } },
        _avg: { total: true },
      }),
      // En çok harcayan 5 müşteri
      this.prisma.order.groupBy({
        by: ['userId'],
        where: { status: { not: 'CANCELLED' } },
        _sum: { total: true },
        _count: { id: true },
        orderBy: { _sum: { total: 'desc' } },
        take: 5,
      }),
    ]);

    // Top müşterilerin detayları
    const topCustomerIds = topCustomers.map((c) => c.userId);
    const customerDetails = await this.prisma.user.findMany({
      where: { id: { in: topCustomerIds } },
      select: { id: true, firstName: true, lastName: true, email: true },
    });

    return {
      total: totalCustomers,
      verified: verifiedCustomers,
      verificationRate:
        totalCustomers > 0
          ? Math.round((verifiedCustomers / totalCustomers) * 100)
          : 0,
      withOrders,
      conversionRate:
        totalCustomers > 0
          ? Math.round((withOrders / totalCustomers) * 100)
          : 0,
      repeatCustomers,
      repeatRate:
        withOrders > 0 ? Math.round((repeatCustomers / withOrders) * 100) : 0,
      avgOrderValue: Number(avgOrderValue._avg.total) || 0,
      topCustomers: topCustomers.map((c) => {
        const detail = customerDetails.find((d) => d.id === c.userId);
        return {
          user: detail,
          totalSpent: Number(c._sum.total),
          orderCount: c._count.id,
        };
      }),
    };
  }

  // ══════════════════════════════════════════════
  // ORDER STATUS BREAKDOWN
  // ══════════════════════════════════════════════

  async getOrderStatusBreakdown() {
    const statuses = await this.prisma.order.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    return statuses.map((s) => ({
      status: s.status,
      count: s._count.id,
    }));
  }

  // ══════════════════════════════════════════════
  // LOW STOCK ALERTS
  // ══════════════════════════════════════════════

  async getLowStockProducts() {
    // Use raw query to compare stock against each product's own lowStockThreshold
    const lowStockIds = await this.prisma.$queryRaw<{ id: string }[]>`
      SELECT id FROM "Product"
      WHERE status = 'ACTIVE' AND stock <= "lowStockThreshold"
      ORDER BY stock ASC
      LIMIT 20
    `;

    if (lowStockIds.length === 0) return [];

    return this.prisma.product.findMany({
      where: {
        id: { in: lowStockIds.map((r) => r.id) },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        sku: true,
        stock: true,
        lowStockThreshold: true,
        images: { take: 1 },
      },
      orderBy: { stock: 'asc' },
    });
  }

  // ══════════════════════════════════════════════
  // AUDIT LOG
  // ══════════════════════════════════════════════

  async logAction(
    userId: string | null,
    action: string,
    entity: string,
    entityId?: string,
    oldData?: any,
    newData?: any,
    ipAddress?: string,
    userAgent?: string,
  ) {
    return this.prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        oldData,
        newData,
        ipAddress,
        userAgent,
      },
    });
  }

  async getAuditLogs(filters: {
    page?: number;
    limit?: number;
    userId?: string;
    action?: string;
    entity?: string;
  }) {
    const { page = 1, limit = 50, userId, action, entity } = filters;

    const where: any = {};
    if (userId) where.userId = userId;
    if (action) where.action = { contains: action };
    if (entity) where.entity = entity;

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        include: {
          user: { select: { email: true, firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data: logs,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // ══════════════════════════════════════════════
  // COUPON MANAGEMENT (CRUD)
  // ══════════════════════════════════════════════

  async getCoupons(filters: {
    page?: number;
    limit?: number;
    isActive?: boolean;
  }) {
    const { page = 1, limit = 20, isActive } = filters;

    const where: any = {};
    if (isActive !== undefined) where.isActive = isActive;

    const [coupons, total] = await Promise.all([
      this.prisma.coupon.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.coupon.count({ where }),
    ]);

    return {
      data: coupons,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async createCoupon(data: {
    code: string;
    description?: string;
    type: string;
    value: number;
    minOrderAmount?: number;
    maxDiscount?: number;
    maxUses?: number;
    expiresAt?: Date;
  }) {
    return this.prisma.coupon.create({
      data: {
        code: data.code.toUpperCase(),
        description: data.description,
        type: data.type,
        value: data.value,
        minOrderAmount: data.minOrderAmount,
        maxDiscount: data.maxDiscount,
        maxUses: data.maxUses,
        expiresAt: data.expiresAt,
        isActive: true,
      },
    });
  }

  async updateCoupon(
    id: string,
    data: Partial<{
      code: string;
      description: string;
      type: string;
      value: number;
      minOrderAmount: number;
      maxDiscount: number;
      maxUses: number;
      isActive: boolean;
      expiresAt: Date;
    }>,
  ) {
    if (data.code) data.code = data.code.toUpperCase();

    return this.prisma.coupon.update({
      where: { id },
      data,
    });
  }

  async deleteCoupon(id: string) {
    await this.prisma.coupon.delete({ where: { id } });
    return { message: 'Kupon silindi' };
  }

  async validateCoupon(code: string, subtotal: number) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      return { valid: false, error: 'Kupon bulunamadı' };
    }

    if (!coupon.isActive) {
      return { valid: false, error: 'Kupon aktif değil' };
    }

    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return { valid: false, error: 'Kuponun süresi dolmuş' };
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return { valid: false, error: 'Kupon kullanım limiti dolmuş' };
    }

    if (coupon.minOrderAmount && subtotal < Number(coupon.minOrderAmount)) {
      return {
        valid: false,
        error: `Minimum sipariş tutarı: ₺${coupon.minOrderAmount}`,
      };
    }

    // İndirim hesapla
    let discount = 0;
    if (coupon.type === 'percentage') {
      discount = subtotal * (Number(coupon.value) / 100);
      if (coupon.maxDiscount && discount > Number(coupon.maxDiscount)) {
        discount = Number(coupon.maxDiscount);
      }
    } else if (coupon.type === 'fixed') {
      discount = Number(coupon.value);
    }

    return {
      valid: true,
      coupon,
      discount: Math.round(discount * 100) / 100,
    };
  }
}
