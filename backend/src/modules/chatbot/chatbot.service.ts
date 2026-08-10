import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
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

ÜRÜNLER:
- Sana ayrıca "GÜNCEL MAĞAZA VERİSİ" bloğu verilir: satıştaki gerçek ürünler, fiyatları (KDV dahil), kavurma/aroma notaları ve linkleri.
- Kahve önerirken SADECE bu blokta olan ürünleri öner; fiyatı ve linkini ver.
- Blokta olmayan ürün adı uydurma. Müşterinin damak tadını (yumuşak/meyvemsi/yoğun, sütlü/sütsüz) sorup ona göre eşleştir.

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
- ₺300 üzeri ücretsiz kargo (güncel eşik GÜNCEL MAĞAZA VERİSİ bloğunda)
- 1-3 iş günü içinde kargoya verilir; anlaşmalı kargo firmalarıyla en uygun gönderim otomatik seçilir
- Fiyatlar KDV dahildir
- PayTR güvenli ödeme (256-bit SSL), 3D Secure + taksit imkanı (2-12 ay)

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

    // Try Claude first; fall back to rule-based if no API key or error
    let response: string;
    let intent = 'ai';

    const aiResult = await this.askClaude(session.id);
    if (aiResult) {
      response = aiResult;
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

  // ── Claude (Anthropic) entegrasyonu ──

  private anthropicClient: Anthropic | null = null;
  private storeContextCache: { text: string; at: number } | null = null;
  private static readonly STORE_CONTEXT_TTL_MS = 5 * 60 * 1000;

  private getAnthropic(): Anthropic | null {
    const apiKey = this.config.get<string>('ANTHROPIC_API_KEY');
    if (!apiKey) return null;
    if (!this.anthropicClient) {
      this.anthropicClient = new Anthropic({ apiKey });
    }
    return this.anthropicClient;
  }

  /**
   * Canlı mağaza verisi: satıştaki ürünler (fiyat/kavurma/aroma/link) +
   * kargo/KDV ayarları. 5 dk bellekte tutulur — hem DB yükünü azaltır hem
   * system prompt'u istekler arasında sabit tutar (prompt cache dostu).
   */
  private async buildStoreContext(): Promise<string> {
    const now = Date.now();
    if (
      this.storeContextCache &&
      now - this.storeContextCache.at < ChatbotService.STORE_CONTEXT_TTL_MS
    ) {
      return this.storeContextCache.text;
    }

    const ROAST_TR: Record<string, string> = {
      LIGHT: 'Açık Kavurma',
      MEDIUM: 'Orta Kavurma',
      MEDIUM_DARK: 'Orta-Koyu Kavurma',
      DARK: 'Koyu Kavurma',
    };

    const [products, settings] = await Promise.all([
      this.prisma.product.findMany({
        where: { status: 'ACTIVE', isActive: true },
        include: {
          category: { select: { name: true, slug: true } },
          variants: { where: { isActive: true }, orderBy: { weight: 'asc' } },
        },
        orderBy: { createdAt: 'desc' },
        take: 60,
      }),
      this.prisma.siteSettings.findMany({
        where: { key: { in: ['freeShippingThreshold', 'shippingCost'] } },
      }),
    ]);

    const settingsMap: Record<string, any> = {};
    settings.forEach((s) => (settingsMap[s.key] = s.value));
    const freeShipping = Number(settingsMap.freeShippingThreshold) || 300;
    const shippingCost = Number(settingsMap.shippingCost) || 97;

    const lines = products.map((p) => {
      const parts = [
        `${p.name} — ₺${Number(p.price).toFixed(0)}`,
        p.category?.name,
        p.roastLevel ? ROAST_TR[p.roastLevel] || p.roastLevel : null,
        p.origin,
        p.aromaProfile?.length ? `aroma: ${p.aromaProfile.join(', ')}` : null,
        p.flavorNotes ? `tat: ${p.flavorNotes}` : null,
        p.stock <= 0 ? 'STOKTA YOK' : null,
        `/products/${p.slug}`,
      ].filter(Boolean);
      const variantInfo = p.variants?.length
        ? ` | seçenekler: ${p.variants
            .map((v) => `${v.weight}g ₺${Number(v.price).toFixed(0)}`)
            .join(', ')}`
        : '';
      return `- ${parts.join(' | ')}${variantInfo}`;
    });

    const text = [
      'GÜNCEL MAĞAZA VERİSİ (fiyatlar KDV dahil):',
      `Kargo: ₺${freeShipping} üzeri ÜCRETSİZ, altı ₺${shippingCost}.`,
      '',
      'SATIŞTAKİ ÜRÜNLER:',
      ...(lines.length ? lines : ['(şu an ürün listesi alınamadı — /collections/all yönlendir)']),
    ].join('\n');

    this.storeContextCache = { text, at: now };
    return text;
  }

  /**
   * Claude'a tam sohbet bağlamı + canlı mağaza verisiyle sor.
   * Anahtar yoksa veya hata olursa null döner (ezber cevaplara düşülür).
   */
  private async askClaude(internalSessionId: string): Promise<string | null> {
    const client = this.getAnthropic();
    if (!client) {
      this.logger.debug('ANTHROPIC_API_KEY not set, using rule-based fallback');
      return null;
    }

    // Chatbot düşük gecikme + düşük maliyet istiyor; kullanıcıyla Haiku
    // üzerinde anlaşıldı. ANTHROPIC_CHATBOT_MODEL ile yükseltilebilir
    // (örn. claude-opus-5).
    const model =
      this.config.get<string>('ANTHROPIC_CHATBOT_MODEL') || 'claude-haiku-4-5';

    try {
      // Son 10 mesaj (az önce kaydedilen kullanıcı mesajı dahil)
      const history = await this.prisma.chatbotMessage.findMany({
        where: { sessionId: internalSessionId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });

      const historyMessages: Anthropic.MessageParam[] = history
        .reverse()
        .map((m) => ({
          role: m.role === 'assistant' ? ('assistant' as const) : ('user' as const),
          content: m.content,
        }));

      // İlk mesaj user olmalı — baştaki assistant (karşılama) mesajlarını at
      while (historyMessages.length && historyMessages[0].role === 'assistant') {
        historyMessages.shift();
      }
      if (!historyMessages.length) return null;

      const storeContext = await this.buildStoreContext();

      const response = await client.messages.create({
        model,
        max_tokens: 700,
        system: [
          { type: 'text', text: SYSTEM_PROMPT },
          {
            type: 'text',
            text: storeContext,
            cache_control: { type: 'ephemeral' },
          },
        ],
        messages: historyMessages,
      });

      if (response.stop_reason === 'refusal') {
        this.logger.warn('Claude refused chatbot request');
        return null;
      }

      const text = response.content
        .filter((b): b is Anthropic.TextBlock => b.type === 'text')
        .map((b) => b.text)
        .join('')
        .trim();
      return text || null;
    } catch (e: any) {
      if (e instanceof Anthropic.APIError) {
        this.logger.error(`Claude API error ${e.status}: ${e.message}`);
      } else {
        this.logger.error(`Claude query failed: ${e?.message || e}`);
      }
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

    // İnsan temsilci / canlı destek talebi → WhatsApp'a yönlendir
    if (
      has(
        'yönlendir',
        'yönelendir',
        'canlı destek',
        'canli destek',
        'insan',
        'temsilci',
        'operatör',
        'operator',
        'müşteri hizmetleri',
        'musteri hizmetleri',
        'birisi',
        'biri ile',
        'ilgili kişi',
        'whatsapp',
        'wp',
        'bana ulaş',
      )
    ) {
      return {
        intent: 'human_handoff',
        response:
          '👋 Sizi hemen ekibimize bağlayalım! En hızlı yanıt için WhatsApp:\n\n📱 **WhatsApp:** https://wa.me/905524622954\n📞 **Telefon:** 0552 462 29 54\n📧 **E-posta:** info@pureolentia.com\n\nÇalışma saatlerimiz: Pzt-Cum 09:00-18:00. WhatsApp\'tan dakikalar içinde dönüş yaparız.',
      };
    }

    // İletişim
    if (has('iletişim', 'iletisim', 'telefon', 'contact', 'ulaş', 'çağrı')) {
      return {
        intent: 'contact',
        response:
          '📞 Bize ulaşın:\n\n📱 **WhatsApp:** https://wa.me/905524622954 _(en hızlı dönüş)_\n📞 **Telefon:** 0552 462 29 54\n📧 **E-posta:** info@pureolentia.com\n📍 Adres: Maltepe, İstanbul\n📝 Form: /contact\n\nÇalışma saatleri: 09:00-18:00 (Hafta içi)',
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

    // Default — sorunuzu anlayamadıysam direkt WhatsApp'a yönlendireyim
    return {
      intent: 'general',
      response:
        "☕ Sorunuzu tam anlayamadım. Size şu konularda yardımcı olabilirim:\n\n• Kahve önerisi (damak tadınıza göre)\n• Sipariş/kargo durumu\n• Abonelik planları\n• Kurumsal/Franchise\n• Ödeme ve iade\n• Demleme rehberi\n\n👉 **Bir temsilciyle görüşmek için:** https://wa.me/905524622954 (WhatsApp)",
    };
  }
}
