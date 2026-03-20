import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PartnerService {
  constructor(private prisma: PrismaService) {}

  /**
   * Partner Dashboard — Özet metrikler
   */
  async getDashboard(partnerId: string) {
    const partner = await this.prisma.user.findUnique({
      where: { id: partnerId },
    });

    if (!partner || partner.role !== 'PARTNER') {
      throw new ForbiddenException('Partner erişimi gerekli');
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    // Bu ayki satışlar
    const monthlySales = await this.prisma.partnerSale.findMany({
      where: {
        partnerId,
        saleDate: { gte: startOfMonth },
      },
    });

    const monthlyRevenue = monthlySales.reduce(
      (sum, s) => sum + Number(s.amount),
      0,
    );
    const monthlyCommission = monthlySales.reduce(
      (sum, s) => sum + Number(s.commission),
      0,
    );

    // Bugünkü satışlar
    const todaySales = monthlySales.filter((s) => s.saleDate >= startOfDay);
    const todayRevenue = todaySales.reduce(
      (sum, s) => sum + Number(s.amount),
      0,
    );

    // Toplam satış
    const totalSalesCount = await this.prisma.partnerSale.count({
      where: { partnerId },
    });

    const totalSalesAggregate = await this.prisma.partnerSale.aggregate({
      where: { partnerId },
      _sum: { amount: true, commission: true },
    });

    return {
      partner: {
        id: partner.id,
        name: `${partner.firstName} ${partner.lastName}`,
        companyName: partner.companyName,
        region: partner.partnerRegion,
      },
      today: {
        salesCount: todaySales.length,
        revenue: todayRevenue,
      },
      thisMonth: {
        salesCount: monthlySales.length,
        revenue: monthlyRevenue,
        commission: monthlyCommission,
      },
      allTime: {
        salesCount: totalSalesCount,
        totalRevenue: Number(totalSalesAggregate._sum.amount || 0),
        totalCommission: Number(totalSalesAggregate._sum.commission || 0),
      },
    };
  }

  /**
   * Partner Satışları — Listeleme
   */
  async getSales(
    partnerId: string,
    page: number = 1,
    limit: number = 20,
    startDate?: Date,
    endDate?: Date,
  ) {
    const where: any = { partnerId };

    if (startDate || endDate) {
      where.saleDate = {};
      if (startDate) where.saleDate.gte = startDate;
      if (endDate) where.saleDate.lte = endDate;
    }

    const [sales, total] = await Promise.all([
      this.prisma.partnerSale.findMany({
        where,
        orderBy: { saleDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.partnerSale.count({ where }),
    ]);

    return {
      data: sales,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Partner Sipariş Oluştur
   */
  async createSale(
    partnerId: string,
    data: {
      amount: number;
      commission?: number;
      latitude?: number;
      longitude?: number;
      region?: string;
      note?: string;
    },
  ) {
    return this.prisma.partnerSale.create({
      data: {
        partnerId,
        amount: data.amount,
        commission: data.commission || data.amount * 0.1, // Varsayılan %10 komisyon
        latitude: data.latitude,
        longitude: data.longitude,
        region: data.region,
        note: data.note,
      },
    });
  }

  /**
   * Partner Profili Güncelle
   */
  async updateProfile(
    partnerId: string,
    data: {
      companyName?: string;
      phone?: string;
      latitude?: number;
      longitude?: number;
      locationLabel?: string;
      partnerRegion?: string;
    },
  ) {
    return this.prisma.user.update({
      where: { id: partnerId },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        companyName: true,
        partnerRegion: true,
        latitude: true,
        longitude: true,
        locationLabel: true,
      },
    });
  }

  /**
   * Admin: Tüm Partnerleri Listele (harita için)
   */
  async getAllPartners(page = 1, limit = 20) {
    const safeLimit = Math.min(limit, 100);
    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where: { role: 'PARTNER', isActive: true },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          companyName: true,
          partnerRegion: true,
          latitude: true,
          longitude: true,
          locationLabel: true,
          createdAt: true,
          _count: { select: { partnerSales: true } },
        },
        skip: (page - 1) * safeLimit,
        take: safeLimit,
      }),
      this.prisma.user.count({ where: { role: 'PARTNER', isActive: true } }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit: safeLimit,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  }

  /**
   * Admin: Partner Satış Haritası — Tüm satışlar koordinatlı
   */
  async getSalesMap(startDate?: Date, endDate?: Date) {
    const where: any = {};

    if (startDate || endDate) {
      where.saleDate = {};
      if (startDate) where.saleDate.gte = startDate;
      if (endDate) where.saleDate.lte = endDate;
    }

    // Sadece koordinatı olan satışlar
    where.latitude = { not: null };
    where.longitude = { not: null };

    return this.prisma.partnerSale.findMany({
      where,
      select: {
        id: true,
        amount: true,
        latitude: true,
        longitude: true,
        region: true,
        saleDate: true,
        partner: {
          select: {
            firstName: true,
            lastName: true,
            companyName: true,
          },
        },
      },
      orderBy: { saleDate: 'desc' },
      take: 500, // Harita performansı için limit
    });
  }

  /**
   * Admin: Bölgesel Performans
   */
  async getRegionalPerformance() {
    const sales = await this.prisma.partnerSale.groupBy({
      by: ['region'],
      _sum: { amount: true, commission: true },
      _count: true,
      where: { region: { not: null } },
    });

    return sales.map((s) => ({
      region: s.region,
      salesCount: s._count,
      totalRevenue: Number(s._sum.amount || 0),
      totalCommission: Number(s._sum.commission || 0),
    }));
  }
}
