import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../prisma/prisma.service';

export interface DailyReport {
  date: string;
  summary: string;
  metrics: {
    totalOrders: number;
    totalRevenue: number;
    newCustomers: number;
    activeSubscriptions: number;
    b2bLeads: number;
    topProducts: { name: string; quantity: number }[];
    conversionRate: number;
  };
  insights: string[];
  alerts: string[];
  calendarEvents: { time: string; event: string }[];
}

@Injectable()
export class AnalysisService {
  private readonly logger = new Logger(AnalysisService.name);

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  /**
   * Günlük Analiz Raporu — Sabah açılış modu
   * Gece boyunca toplanan verilerden analiz oluşturur
   * Admin sabah geldiğinde sesli rapor alır (TTS ile)
   */
  async generateDailyReport(date?: Date): Promise<DailyReport> {
    const targetDate = date || new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    this.logger.log(`Generating daily report for ${startOfDay.toISOString()}`);

    // Sipariş metrikleri
    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: { gte: startOfDay, lte: endOfDay },
      },
      include: { items: { include: { product: true } } },
    });

    const totalRevenue = orders.reduce(
      (sum, o) => sum + Number(o.totalAmount),
      0,
    );

    // Yeni müşteriler
    const newCustomers = await this.prisma.user.count({
      where: {
        createdAt: { gte: startOfDay, lte: endOfDay },
        role: 'CUSTOMER',
      },
    });

    // Aktif abonelikler
    const activeSubscriptions = await this.prisma.subscription.count({
      where: { status: 'ACTIVE' },
    });

    // B2B leads
    const b2bLeads = await this.prisma.b2bLead.count({
      where: {
        createdAt: { gte: startOfDay, lte: endOfDay },
      },
    });

    // En çok satan ürünler
    const productSales = new Map<string, number>();
    orders.forEach((order) => {
      order.items.forEach((item) => {
        const name = item.product.name;
        productSales.set(name, (productSales.get(name) || 0) + item.quantity);
      });
    });

    const topProducts = Array.from(productSales.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, quantity]) => ({ name, quantity }));

    // Dünkü verilerle karşılaştır
    const yesterday = new Date(startOfDay);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayEnd = new Date(yesterday);
    yesterdayEnd.setHours(23, 59, 59, 999);

    const yesterdayOrders = await this.prisma.order.count({
      where: {
        createdAt: { gte: yesterday, lte: yesterdayEnd },
      },
    });

    // İçgörüler ve uyarılar
    const insights: string[] = [];
    const alerts: string[] = [];

    if (orders.length > yesterdayOrders) {
      insights.push(
        `Bugün ${orders.length} sipariş alındı, düne göre %${Math.round(((orders.length - yesterdayOrders) / (yesterdayOrders || 1)) * 100)} artış.`,
      );
    } else if (orders.length < yesterdayOrders) {
      alerts.push(
        `Sipariş sayısı düne göre %${Math.round(((yesterdayOrders - orders.length) / (yesterdayOrders || 1)) * 100)} azaldı.`,
      );
    }

    if (b2bLeads > 0) {
      insights.push(`${b2bLeads} yeni B2B lead geldi.`);
    }

    // Stok uyarısı (düşük stoklu ürünler)
    const lowStockProducts = await this.prisma.productVariant.findMany({
      where: { stock: { lt: 10 } },
      include: { product: true },
    });

    if (lowStockProducts.length > 0) {
      alerts.push(
        `${lowStockProducts.length} üründe stok kritik seviyede: ${lowStockProducts.map((p) => p.product.name).join(', ')}`,
      );
    }

    // Bugünkü takvim (planlanan abonelik yenilemeleri, teslimatlar)
    const calendarEvents: { time: string; event: string }[] = [];

    const pendingShipments = await this.prisma.order.count({
      where: { status: 'PROCESSING' },
    });

    if (pendingShipments > 0) {
      calendarEvents.push({
        time: '09:00',
        event: `${pendingShipments} sipariş kargoya hazırlanacak`,
      });
    }

    const subscriptionRenewals = await this.prisma.subscriptionCycle.count({
      where: {
        startDate: { lte: endOfDay },
        endDate: { gte: startOfDay },
        status: 'PENDING',
      },
    });

    if (subscriptionRenewals > 0) {
      calendarEvents.push({
        time: '10:00',
        event: `${subscriptionRenewals} abonelik yenilemesi yapılacak`,
      });
    }

    // Konversion oranı
    const totalVisitors = 100; // TODO: Analytics entegrasyonu
    const conversionRate =
      totalVisitors > 0 ? (orders.length / totalVisitors) * 100 : 0;

    const summary = `Günaydın! ${startOfDay.toLocaleDateString('tr-TR')} tarihli raporunuz: ${orders.length} sipariş, ₺${totalRevenue.toLocaleString('tr-TR')} ciro, ${newCustomers} yeni müşteri.`;

    return {
      date: startOfDay.toISOString().split('T')[0],
      summary,
      metrics: {
        totalOrders: orders.length,
        totalRevenue,
        newCustomers,
        activeSubscriptions,
        b2bLeads,
        topProducts,
        conversionRate,
      },
      insights,
      alerts,
      calendarEvents,
    };
  }

  /**
   * Sesli rapor için metin oluştur (TTS ile okunacak)
   */
  async generateVoiceReport(date?: Date): Promise<string> {
    const report = await this.generateDailyReport(date);

    let voiceText = report.summary + ' ';

    if (report.insights.length > 0) {
      voiceText += 'Öne çıkan gelişmeler: ' + report.insights.join('. ') + '. ';
    }

    if (report.alerts.length > 0) {
      voiceText += 'Dikkat edilmesi gerekenler: ' + report.alerts.join('. ') + '. ';
    }

    if (report.calendarEvents.length > 0) {
      voiceText += 'Bugünkü takvim: ';
      report.calendarEvents.forEach((event) => {
        voiceText += `Saat ${event.time}'da ${event.event}. `;
      });
    }

    if (report.metrics.topProducts.length > 0) {
      voiceText += `En çok satan ürün: ${report.metrics.topProducts[0].name}, ${report.metrics.topProducts[0].quantity} adet. `;
    }

    voiceText += 'İyi bir gün geçirmenizi dilerim!';

    return voiceText;
  }

  /**
   * LangChain ile doğal dil analiz sorgusu
   * Phase 2: "Geçen haftanın en çok satan ürünü ne?" gibi sorulara cevap
   */
  async queryAnalysis(question: string): Promise<{ answer: string; data?: any }> {
    this.logger.log(`Analysis query: ${question}`);

    // TODO: Phase 2 - LangChain + SQL Agent entegrasyonu
    // const agent = createSqlAgent({
    //   llm: new ChatOpenAI({ modelName: 'gpt-4' }),
    //   db: this.prisma,
    //   topK: 10,
    // });

    return {
      answer: `[Analiz sorgusu alındı: "${question}" — Phase 2'de LangChain ile aktif olacak]`,
    };
  }
}
