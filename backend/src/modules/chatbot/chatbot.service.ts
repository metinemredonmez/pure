import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

const SYSTEM_PROMPT = `Sen Pure Olentia'nın (pureolentia.com) resmi yapay zeka asistanısın. Pure Olentia Türkiye'de specialty (özel) kahve satan premium bir markadır.

KİMLİK & STİL:
- İsmin "Pure Olentia Asistan"
- Sıcak, samimi, kısa ve profesyonel konuş
- Türkçe cevap ver (müşteri İngilizce yazarsa İngilizce)
- Emoji kullanabilirsin ama az (☕ 📦 🎁 ↩️ 🏢)
- Kahve tutkunu gibi davran, bilgili ol
- Emin olmadığın bir şeyi uydurma, "İletişim sayfamızdan bize ulaşın" de

MARKA BİLGİSİ:
- Tarladan fincana izlenebilir specialty kahve
- Türkiye'nin premium kahve markası
- Maltepe / İstanbul merkezli
- E-posta: info@pureolentia.com
- Telefon: 0552 462 29 54

ÜRÜNLER (backend'den gelir — güncel fiyat için siteyi yönlendir):
- Türk Kahvesi (100gr, 200gr, 3'lü set, 12'li kutu)
- Filtre kahveler: Ethiopia Yirgacheffe, Colombia Supremo, Brazil Santos, Kenya AA, Guatemala Antigua
- Espresso blendleri: Olentia House Blend
- Cold Brew Konsantre
- Ekipmanlar: demleme aletleri

SAYFA YÖNLENDİRMELERİ:
- Tüm ürünler: /collections/all
- Türk kahveleri: /collections/turk-kahvesi
- Filtre: /collections/filtre-kahve
- Espresso: /collections/espresso
- Abonelik: /subscription (3/6/12 ay, %10-20 indirim)
- B2B/Kurumsal: /b2b
- Franchise: /franchise (₺500K+ yatırım)
- Kurumsal hediye: /kurumsal-hediye
- Demleme rehberi: /demleme-rehberi
- İade/değişim: /iade-degisim
- SSS: /sss
- İletişim: /contact
- Sipariş takibi: /siparis-takibi

KARGO & ÖDEME:
- ₺300 üzeri ücretsiz kargo
- 1-3 iş günü teslimat
- Yurtiçi/Aras kargo
- PayTR güvenli ödeme (256-bit SSL)
- 3D Secure + taksit imkanı (2-12 ay)

İADE:
- 14 gün içinde açılmamış ürün iade edilebilir
- Kavrulmuş ve açılmış kahve iade edilemez (hijyen)

DEMLEME TAVSİYELERİ:
- Temel oran: 1:16 (1g kahve / 16ml su)
- Su sıcaklığı: 92-96°C
- Filtre için orta-ince öğütme, espresso için ince

KURAL: Cevapların kısa ve madde madde olmalı. Kullanıcıyı ilgili sayfaya yönlendir. Uzun paragraflardan kaçın.`;

@Injectable()
export class ChatbotService {
  private readonly logger = new Logger(ChatbotService.name);

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

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

    // Try OpenAI first; fall back to rule-based if no API key or error
    let response: string;
    let intent = 'ai';

    const openaiResult = await this.askOpenAI(session.id, content);
    if (openaiResult) {
      response = openaiResult;
    } else {
      const ruleResult = this.processMessage(content);
      response = ruleResult.response;
      intent = ruleResult.intent;
    }

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

  /**
   * Ask OpenAI with full conversation context.
   * Returns null on any error or if API key is missing.
   */
  private async askOpenAI(internalSessionId: string, userMessage: string): Promise<string | null> {
    const apiKey = this.config.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      this.logger.debug('OPENAI_API_KEY not set, using rule-based fallback');
      return null;
    }

    const model = this.config.get<string>('OPENAI_CHATBOT_MODEL') || 'gpt-4o-mini';

    try {
      // Fetch last 10 messages for context
      const history = await this.prisma.chatbotMessage.findMany({
        where: { sessionId: internalSessionId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });

      // Reverse to chronological order, exclude the just-saved user message (already included as last)
      const historyMessages = history.reverse().map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      }));

      const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...historyMessages,
      ];

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7,
          max_tokens: 400,
        }),
      });

      if (!response.ok) {
        const err = await response.text().catch(() => '');
        this.logger.error(`OpenAI API error ${response.status}: ${err.slice(0, 200)}`);
        return null;
      }

      const json = (await response.json()) as any;
      const text = json?.choices?.[0]?.message?.content?.trim();
      return text || null;
    } catch (e: any) {
      this.logger.error(`OpenAI query failed: ${e.message}`);
      return null;
    }
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
