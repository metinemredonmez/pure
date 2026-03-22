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

    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);

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
      where: { status: 'PREPARING' },
    });

    if (pendingShipments > 0) {
      calendarEvents.push({
        time: '09:00',
        event: `${pendingShipments} sipariş kargoya hazırlanacak`,
      });
    }

    const subscriptionRenewals = await this.prisma.subscriptionCycle.count({
      where: {
        billingDate: { gte: startOfDay, lte: endOfDay },
        status: 'pending',
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
      voiceText +=
        'Dikkat edilmesi gerekenler: ' + report.alerts.join('. ') + '. ';
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
   * OpenAI ile doğal dil analiz sorgusu
   * Veritabanından güncel verileri çekip context olarak gönderir
   */
  async queryAnalysis(
    question: string,
  ): Promise<{ answer: string; data?: any }> {
    this.logger.log(`Analysis query: ${question}`);

    const apiKey = this.configService.get('OPENAI_API_KEY');
    const model = this.configService.get('OPENAI_MODEL') || 'gpt-4o';

    // Veritabanından güncel metrikleri topla
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);

    const [
      totalOrders, monthlyOrders, weeklyOrders,
      totalCustomers, totalProducts,
      activeSubscriptions, b2bLeads,
      recentOrders, topVariants,
    ] = await Promise.all([
      this.prisma.order.count(),
      this.prisma.order.count({ where: { createdAt: { gte: startOfMonth } } }),
      this.prisma.order.count({ where: { createdAt: { gte: startOfWeek } } }),
      this.prisma.user.count({ where: { role: 'CUSTOMER' } }),
      this.prisma.product.count({ where: { isActive: true } }),
      this.prisma.subscription.count({ where: { status: 'ACTIVE' } }),
      this.prisma.b2bLead.count(),
      this.prisma.order.findMany({
        take: 20,
        orderBy: { createdAt: 'desc' },
        select: { total: true, status: true, createdAt: true },
      }),
      this.prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: { quantity: true },
        _count: true,
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      }),
    ]);

    const monthlyRevenue = recentOrders
      .filter(o => new Date(o.createdAt) >= startOfMonth)
      .reduce((s, o) => s + Number(o.total), 0);

    // Top ürün isimlerini al
    let topProductNames: string[] = [];
    if (topVariants.length > 0) {
      const products = await this.prisma.product.findMany({
        where: { id: { in: topVariants.map(v => v.productId) } },
        select: { id: true, name: true },
      });
      topProductNames = topVariants.map(v => {
        const p = products.find(pr => pr.id === v.productId);
        return `${p?.name || 'Bilinmeyen'} (${v._sum.quantity} adet)`;
      });
    }

    const context = `
Olentia Pure — Kahve E-ticaret Admin Paneli Verileri (${now.toLocaleDateString('tr-TR')}):
- Toplam siparis: ${totalOrders}
- Bu ayki siparis: ${monthlyOrders}
- Bu haftaki siparis: ${weeklyOrders}
- Bu ayki ciro: ₺${monthlyRevenue.toLocaleString('tr-TR')}
- Toplam musteri: ${totalCustomers}
- Aktif urun: ${totalProducts}
- Aktif abonelik: ${activeSubscriptions}
- B2B lead sayisi: ${b2bLeads}
- En cok satan urunler: ${topProductNames.length > 0 ? topProductNames.join(', ') : 'Veri yok'}
- Son siparis durumlari: ${recentOrders.slice(0, 5).map(o => `₺${Number(o.total).toFixed(0)} (${o.status})`).join(', ') || 'Yok'}
`.trim();

    // OpenAI API key yoksa basit cevap ver
    if (!apiKey) {
      return this.generateSimpleAnswer(question, context);
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content: `Sen Olentia Pure kahve e-ticaret platformunun AI analiz asistanısın. Türkçe cevap ver. Kısa, net ve veri odaklı cevaplar ver. Emoji kullan. Verilen veritabanı verilerini kullanarak soruları cevapla.\n\nGüncel Veriler:\n${context}`,
            },
            { role: 'user', content: question },
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      const data = await response.json();

      if (data.choices?.[0]?.message?.content) {
        return { answer: data.choices[0].message.content };
      }

      return { answer: `API yanıt veremedi: ${data.error?.message || 'Bilinmeyen hata'}` };
    } catch (error) {
      this.logger.error(`OpenAI query error: ${error.message}`);
      return this.generateSimpleAnswer(question, context);
    }
  }

  /**
   * OpenAI yoksa basit istatistik cevabı
   */
  private generateSimpleAnswer(question: string, context: string): { answer: string } {
    const q = question.toLowerCase();
    const lines = context.split('\n').filter(l => l.includes(':'));

    if (q.includes('siparis') || q.includes('order')) {
      const monthly = lines.find(l => l.includes('ayki siparis'));
      return { answer: `📦 ${monthly?.trim() || 'Siparis verisi bulunamadi.'}` };
    }
    if (q.includes('ciro') || q.includes('gelir') || q.includes('revenue')) {
      const rev = lines.find(l => l.includes('ciro'));
      return { answer: `💰 ${rev?.trim() || 'Ciro verisi bulunamadi.'}` };
    }
    if (q.includes('musteri') || q.includes('customer')) {
      const cust = lines.find(l => l.includes('musteri'));
      return { answer: `👥 ${cust?.trim() || 'Musteri verisi bulunamadi.'}` };
    }
    if (q.includes('urun') || q.includes('product') || q.includes('satan')) {
      const prod = lines.find(l => l.includes('satan'));
      return { answer: `☕ ${prod?.trim() || 'Urun verisi bulunamadi.'}` };
    }
    if (q.includes('abonelik') || q.includes('subscription')) {
      const sub = lines.find(l => l.includes('abonelik'));
      return { answer: `📋 ${sub?.trim() || 'Abonelik verisi bulunamadi.'}` };
    }

    return {
      answer: `📊 Mevcut veriler:\n${context}\n\n💡 Daha detaylı analiz için OpenAI API key'i ayarlardan ekleyin.`,
    };
  }
}
