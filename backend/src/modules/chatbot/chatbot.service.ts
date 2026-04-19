import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ChatbotService {
  constructor(private prisma: PrismaService) {}

  async sendMessage(sessionId: string, userId: string | null, content: string) {
    // Get or create session
    let session = await this.prisma.chatbotSession.findUnique({
      where: { sessionId },
    });

    if (!session) {
      session = await this.prisma.chatbotSession.create({
        data: { sessionId, userId },
      });
    }

    // Save user message
    await this.prisma.chatbotMessage.create({
      data: { sessionId: session.id, role: 'user', content },
    });

    // Detect intent and generate response (Phase 1: rule-based)
    const { intent, response } = this.processMessage(content);

    // Save assistant response
    const message = await this.prisma.chatbotMessage.create({
      data: {
        sessionId: session.id,
        role: 'assistant',
        content: response,
        intent,
      },
    });

    return { intent, response, messageId: message.id };
  }

  async getSessionHistory(sessionId: string) {
    const session = await this.prisma.chatbotSession.findUnique({
      where: { sessionId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
    return session?.messages || [];
  }

  /**
   * Get user's own chat history (authenticated)
   */
  async getSessionHistoryByUser(userId: string) {
    const sessions = await this.prisma.chatbotSession.findMany({
      where: { userId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
      orderBy: { updatedAt: 'desc' },
      take: 10,
    });
    return sessions;
  }

  // Admin: list sessions (with pagination)
  async findAllSessions(page = 1, limit = 20) {
    const safeLimit = Math.min(limit, 100);
    const [data, total] = await Promise.all([
      this.prisma.chatbotSession.findMany({
        include: {
          messages: { orderBy: { createdAt: 'desc' }, take: 1 },
          _count: { select: { messages: true } },
        },
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * safeLimit,
        take: safeLimit,
      }),
      this.prisma.chatbotSession.count(),
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

  // Phase 1: Rule-based intent detection
  private processMessage(content: string): {
    intent: string;
    response: string;
  } {
    const lower = content.toLowerCase();
    const has = (...keywords: string[]) =>
      keywords.some((k) => lower.includes(k));

    // Selamlaşma
    if (has('merhaba', 'selam', 'iyi günler', 'günaydın', 'hello', 'hi')) {
      return {
        intent: 'greeting',
        response:
          'Merhaba! ☕ Pure Olentia asistanıyım. Size nasıl yardımcı olabilirim?\n\n• Kahve önerisi\n• Sipariş/kargo durumu\n• Abonelik planları\n• Kurumsal çözümler\n• Franchise bilgisi',
      };
    }

    // Sipariş / Kargo
    if (has('sipariş', 'kargo', 'order', 'teslimat', 'nezaman', 'ne zaman gelir')) {
      return {
        intent: 'order_status',
        response:
          '📦 Siparişleriniz taze kavrulmuş olarak gönderilir, 1-3 iş günü içinde kargoya verilir.\n\n• Kargo firması: Yurtiçi / Aras\n• ₺300 üzeri siparişlerde ÜCRETSİZ kargo\n• Takip için: /siparis-takibi\n• Hesabınızdan da kontrol edebilirsiniz.',
      };
    }

    // Abonelik
    if (has('abonelik', 'subscription', 'üyelik', 'düzenli')) {
      return {
        intent: 'subscription',
        response:
          '☕ Kahve Aboneliği — her ay taze kavrulmuş kahve kapınızda!\n\n• 3/6/12 ay seçenekleri (%10-20 indirim)\n• Türk Kahvesi, Filtre, Espresso\n• 250g, 500g, 1kg gramaj\n• Öğütme tercihiniz\n\nDetay: /subscription',
      };
    }

    // İade
    if (has('iade', 'return', 'geri', 'değişim', 'değiştir')) {
      return {
        intent: 'return',
        response:
          '↩️ İade politikamız:\n\n• Açılmamış ürünlerde 14 gün içinde iade\n• Kavrulmuş kahveler hijyen sebebiyle açılmışsa iade edilemez\n• Hasar/eksik ürün durumunda ücretsiz değişim\n\nDetay: /iade-degisim',
      };
    }

    // Kahve önerisi
    if (has('öneri', 'tavsiye', 'hangi', 'recommend', 'önerir')) {
      return {
        intent: 'recommend',
        response:
          '☕ Size hangi kahve uygun, damak tadınıza bakalım:\n\n• Yumuşak/tatlı seviyorsanız → **Brezilya Santos** (fındıksı, çikolata)\n• Meyvemsi/canlı → **Ethiopia Yirgacheffe** (çiçeksi, limon)\n• Dengeli → **Colombia Supremo** (karamel, ceviz)\n• Koyu/yoğun → **Kenya AA** (karadut, şarap)\n\nTümü: /collections/all',
      };
    }

    // Demleme
    if (has('demle', 'brew', 'nasıl yapılır', 'v60', 'french press', 'espresso')) {
      return {
        intent: 'brewing',
        response:
          '☕ Demleme rehberimiz:\n\n**Temel Oran:** 1:16 (1g kahve : 16ml su)\n**Su Sıcaklığı:** 92-96°C\n**Öğütme:** Filtre için orta-ince, Espresso için ince\n\nTüm tarifler: /demleme-rehberi',
      };
    }

    // B2B / Kurumsal
    if (has('b2b', 'kurumsal', 'ofis', 'şirket', 'toplu', 'firma')) {
      return {
        intent: 'b2b',
        response:
          '🏢 Kurumsal çözümlerimiz:\n\n• Ofisler, restoranlar, oteller için özel fiyat\n• Aylık 10kg+ siparişlerde %15-25 indirim\n• Fatura + düzenli teslimat\n• Barista eğitimi\n\nTeklif al: /b2b',
      };
    }

    // Franchise
    if (has('franchise', 'bayilik', 'mağaza', 'iş ortağı')) {
      return {
        intent: 'franchise',
        response:
          '🚀 Pure Olentia Franchise:\n\n• Anahtar teslim konsept\n• Barista eğitimi ve sürekli destek\n• Yatırım: ₺500K+\n• 3-6 ay açılış süreci\n\nBaşvuru: /franchise',
      };
    }

    // Ödeme
    if (has('ödeme', 'payment', 'kart', 'taksit', 'havale')) {
      return {
        intent: 'payment',
        response:
          '💳 Ödeme seçenekleri:\n\n• Kredi/banka kartı (PayTR altyapısı — 256-bit SSL)\n• 2-12 ay taksit imkanı\n• Havale/EFT\n• 3D Secure güvenlik\n\nBilgi: /odeme-teslimat',
      };
    }

    // Menşei / Origin
    if (has('menşe', 'origin', 'nereden', 'ülke', 'farm')) {
      return {
        intent: 'origin',
        response:
          '🌍 Kahvelerimizin menşei:\n\n• **Etiyopya** — Yirgacheffe, Sidamo\n• **Kolombiya** — Huila, Supremo\n• **Brezilya** — Cerrado, Santos\n• **Kenya** — AA Nyeri\n• **Guatemala** — Antigua\n\nTümü izlenebilir, specialty grade (80+).',
      };
    }

    // İletişim
    if (has('iletişim', 'telefon', 'contact', 'ulaş', 'çağrı')) {
      return {
        intent: 'contact',
        response:
          '📞 Bize ulaşın:\n\n• E-posta: info@pureolentia.com\n• Telefon: 0552 462 29 54\n• Form: /contact\n• Adres: Maltepe, İstanbul\n\nÇalışma saatleri: 09:00-18:00 (Hafta içi)',
      };
    }

    // SSS
    if (has('sss', 'faq', 'soru', 'yardım', 'help')) {
      return {
        intent: 'faq',
        response:
          '❓ Sıkça sorulan sorular için: /sss\n\nVeya daha spesifik bir konu sorun:\n• Sipariş takibi\n• Abonelik\n• İade/değişim\n• Kahve önerisi\n• Ödeme',
      };
    }

    // Default
    return {
      intent: 'general',
      response:
        "☕ Sorunuzu tam anlayamadım. Size şu konularda yardımcı olabilirim:\n\n• Kahve önerisi (damak tadınıza göre)\n• Sipariş/kargo durumu\n• Abonelik planları\n• Kurumsal/Franchise\n• Ödeme ve iade\n• Demleme rehberi\n\nKonu seçin veya sorunuzu yazın, size yönlendireyim.",
    };
  }
}
