import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../prisma/prisma.service';
import OpenAI from 'openai';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatResponse {
  message: string;
  sessionId: string;
  sources?: string[];
}

@Injectable()
export class ChatboxService {
  private readonly logger = new Logger(ChatboxService.name);
  private openai: OpenAI | null = null;

  // Sistem prompt'u — Olentia Pure kahve asistanı
  private readonly systemPrompt = `Sen Olentia Pure'un AI kahve asistanısın.
Görevlerin:
- Müşterilere kahve seçiminde yardım etmek
- Ürün bilgisi vermek (çekirdek tipi, kavurma seviyesi, aroma profili)
- Sipariş durumu hakkında bilgi vermek
- Abonelik planları hakkında bilgi vermek
- B2B kurumsal müşterilere yönlendirme yapmak
- İade ve değişim süreçleri hakkında bilgi vermek

Kurallar:
- Türkçe yanıt ver
- Kibar ve profesyonel ol
- Kahve bilgisi konusunda uzman gibi davran
- Olentia Pure markasını temsil et
- Fiyat bilgisi verirken güncel katalogdan al`;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
      this.logger.log('OpenAI client initialized (model: ' + this.getModel() + ')');
    } else {
      this.logger.warn(
        'OPENAI_API_KEY missing — chatbox will fallback to rule-based responses',
      );
    }
  }

  private getModel(): string {
    return this.configService.get<string>('OPENAI_MODEL') || 'gpt-4o-mini';
  }

  /**
   * Chatbox: Sitenin sağ tarafında açılan AI asistan
   * Phase 1: Prompt tabanlı (system prompt + context)
   * Phase 2: LangChain + RAG (ürün kataloğu, sipariş veritabanı)
   */
  async chat(
    message: string,
    sessionId: string,
    userId?: string,
  ): Promise<ChatResponse> {
    this.logger.log(
      `Chat request - session: ${sessionId}, user: ${userId || 'guest'}`,
    );

    // Konuşma geçmişini getir
    const history = await this.getSessionHistory(sessionId);

    // OpenAI varsa LLM'i kullan, yoksa rule-based fallback
    let response: string;
    if (this.openai) {
      try {
        response = await this.generateLLMResponse(message, history);
      } catch (e: any) {
        this.logger.error(`OpenAI error, fallback to rules: ${e?.message}`);
        response = this.generateResponse(message, history);
      }
    } else {
      response = this.generateResponse(message, history);
    }

    // Mesajları kaydet
    await this.saveMessage(sessionId, 'user', message, userId);
    await this.saveMessage(sessionId, 'assistant', response, userId);

    return {
      message: response,
      sessionId,
    };
  }

  /**
   * OpenAI Chat Completions ile yanıt üret.
   * Son 10 mesajı context olarak gönderir, system prompt ile kalite kontrol.
   */
  private async generateLLMResponse(
    message: string,
    history: ChatMessage[],
  ): Promise<string> {
    if (!this.openai) throw new Error('OpenAI client not initialized');

    // Son 10 mesajı al (token sınırı için)
    const recent = history.slice(-10);
    const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
      { role: 'system', content: this.systemPrompt },
      ...recent.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user', content: message },
    ];

    const completion = await this.openai.chat.completions.create({
      model: this.getModel(),
      messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    const reply = completion.choices?.[0]?.message?.content?.trim();
    if (!reply) throw new Error('Empty response from OpenAI');
    return reply;
  }

  /**
   * Session ownership kontrolü
   */
  async verifySessionOwnership(
    sessionId: string,
    userId: string,
  ): Promise<boolean> {
    const session = await this.prisma.chatbotSession.findUnique({
      where: { sessionId },
      select: { userId: true },
    });

    if (!session) return false;

    // Session user'a ait mi veya guest session mı (userId null)
    return session.userId === userId || session.userId === null;
  }

  /**
   * Konuşma geçmişini getir
   */
  async getSessionHistory(sessionId: string): Promise<ChatMessage[]> {
    try {
      const session = await this.prisma.chatbotSession.findUnique({
        where: { sessionId },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
            take: 20, // Son 20 mesaj
          },
        },
      });

      if (!session) return [];

      return session.messages.map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }));
    } catch {
      return [];
    }
  }

  /**
   * Mesaj kaydet
   */
  private async saveMessage(
    sessionId: string,
    role: string,
    content: string,
    userId?: string,
  ): Promise<void> {
    try {
      // Session yoksa oluştur
      let session = await this.prisma.chatbotSession.findUnique({
        where: { sessionId },
      });

      if (!session) {
        session = await this.prisma.chatbotSession.create({
          data: {
            sessionId,
            userId: userId || null,
          },
        });
      }

      await this.prisma.chatbotMessage.create({
        data: {
          sessionId: session.id,
          role,
          content,
        },
      });
    } catch (error) {
      this.logger.error(`Message save failed: ${error}`);
    }
  }

  /**
   * Phase 1: Kural tabanlı yanıt üretici
   * Phase 2'de LangChain/RAG ile değiştirilecek
   */
  private generateResponse(message: string, _history: ChatMessage[]): string {
    const lower = message.toLowerCase();

    if (
      lower.includes('merhaba') ||
      lower.includes('selam') ||
      lower.includes('hey')
    ) {
      return "Merhaba! Olentia Pure'a hoş geldiniz. Size nasıl yardımcı olabilirim? ☕";
    }

    if (
      lower.includes('kahve') &&
      (lower.includes('öner') || lower.includes('tavsiye'))
    ) {
      return 'Size birkaç soru sorarak en uygun kahveyi bulabilirim. Hangi demleme yöntemini kullanıyorsunuz? (Filtre, Espresso, French Press, Türk Kahvesi)';
    }

    if (
      lower.includes('sipariş') &&
      (lower.includes('durum') ||
        lower.includes('nerede') ||
        lower.includes('takip'))
    ) {
      return 'Sipariş durumunuzu kontrol edebilmem için sipariş numaranızı paylaşır mısınız? (OLN-2024-XXXXXX formatında)';
    }

    if (lower.includes('abonelik') || lower.includes('subscription')) {
      return 'Abonelik planlarımız:\n• **Starter** — Aylık 500g, ₺299\n• **Coffee Lover** — Aylık 1kg, ₺549\n• **Office Mini** — Aylık 3kg, ₺1.399\n\nDetaylı bilgi için abonelik sayfamızı ziyaret edebilirsiniz.';
    }

    if (
      lower.includes('b2b') ||
      lower.includes('kurumsal') ||
      lower.includes('ofis')
    ) {
      return 'Kurumsal müşterilerimize özel çözümler sunuyoruz. Ofis kahve makinesi kiralama, toptan kahve tedariği ve özel harmanlama hizmetlerimiz bulunmaktadır. Sizi B2B ekibimizle görüştürmemi ister misiniz?';
    }

    if (
      lower.includes('iade') ||
      lower.includes('değişim') ||
      lower.includes('iptal')
    ) {
      return 'İade ve değişim politikamız:\n• Teslimattan itibaren 14 gün içinde iade\n• Açılmamış ürünlerde tam iade\n• Açılmış ürünlerde kalite sorunu varsa değişim\n\nİade başlatmak için sipariş numaranızı paylaşır mısınız?';
    }

    if (
      lower.includes('fiyat') ||
      lower.includes('ücret') ||
      lower.includes('kaç')
    ) {
      return "Ürün fiyatlarımız 250g'dan başlayarak ₺129 - ₺599 arasında değişmektedir. Hangi ürünle ilgileniyorsunuz?";
    }

    if (lower.includes('kargo') || lower.includes('teslimat')) {
      return '500₺ üzeri siparişlerde kargo ücretsizdir. Standart teslimat 2-4 iş günü, ekspres teslimat ise 1 iş günüdür.';
    }

    return 'Anladım. Bu konuda size daha iyi yardımcı olabilmem için biraz daha detay verebilir misiniz? Kahve seçimi, sipariş takibi, abonelik veya kurumsal çözümler hakkında yardımcı olabilirim.';
  }
}
