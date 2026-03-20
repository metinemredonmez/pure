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

    if (
      lower.includes('sipariş') ||
      lower.includes('kargo') ||
      lower.includes('order')
    ) {
      return {
        intent: 'order_status',
        response:
          'Sipariş durumunuzu kontrol etmek için hesabınıza giriş yapın ve "Siparişlerim" sayfasını ziyaret edin.',
      };
    }

    if (lower.includes('abonelik') || lower.includes('subscription')) {
      return {
        intent: 'subscription',
        response:
          'Abonelik planlarımızı /subscription sayfasında görebilirsiniz. Starter (500g), Coffee Lover (1kg) ve Office Mini (3kg) seçeneklerimiz var.',
      };
    }

    if (lower.includes('iade') || lower.includes('return')) {
      return {
        intent: 'return',
        response:
          'İade işlemi için sipariş detay sayfasından iade talebi oluşturabilirsiniz. 14 gün içinde iade kabul edilmektedir.',
      };
    }

    if (
      lower.includes('kahve') ||
      lower.includes('öneri') ||
      lower.includes('recommend')
    ) {
      return {
        intent: 'recommend',
        response:
          'Size özel kahve önerisi için "Kahveni Bul" quizimizi deneyin! Damak tadınıza göre en uygun kahveyi bulalım.',
      };
    }

    if (
      lower.includes('b2b') ||
      lower.includes('kurumsal') ||
      lower.includes('ofis')
    ) {
      return {
        intent: 'b2b',
        response:
          'Kurumsal çözümlerimiz için /b2b sayfamızı ziyaret edin veya formu doldurun, ekibimiz sizinle iletişime geçecektir.',
      };
    }

    return {
      intent: 'general',
      response:
        "Merhaba! Olentia Pure'a hoş geldiniz. Size nasıl yardımcı olabilirim? Sipariş, abonelik, iade veya kahve önerisi konularında yardımcı olabilirim.",
    };
  }
}
