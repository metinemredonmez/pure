import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { SubscriptionStatus, GrindType, PaymentMethod } from '@prisma/client';
import { PaymentService } from '../payment/payment.service';
import { NotificationService } from '../notification/notification.service';
import { EncryptionService } from '../../common/services/encryption.service';

@Injectable()
export class SubscriptionService implements OnModuleInit {
  private readonly logger = new Logger(SubscriptionService.name);

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private paymentService: PaymentService,
    private notificationService: NotificationService,
    private encryptionService: EncryptionService,
  ) {}

  /**
   * Register webhook callbacks on PaymentService so that
   * subscription payments are automatically handled.
   */
  onModuleInit() {
    this.paymentService.registerSubscriptionCallbacks(
      this.completeSubscription.bind(this),
      this.handleSubscriptionPaymentFailed.bind(this),
    );
    this.logger.log('Subscription webhook callbacks registered on PaymentService');
  }

  // ══════════════════════════════════════════════
  // PLANS
  // ══════════════════════════════════════════════

  async getPlans() {
    return this.prisma.subPlan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async getPlanById(planId: string) {
    const plan = await this.prisma.subPlan.findUnique({ where: { id: planId } });
    if (!plan) throw new NotFoundException('Plan bulunamadı');
    return plan;
  }

  // ══════════════════════════════════════════════
  // PLAN CRUD (Admin)
  // ══════════════════════════════════════════════

  async createPlan(data: {
    name: string;
    slug: string;
    description?: string;
    image?: string;
    monthlyWeight?: number;
    priceMonthly: number;
    discountPercent?: number;
    freeShipping?: boolean;
    isActive?: boolean;
    sortOrder?: number;
    availableDurations?: any;
    availablePeriods?: any;
    availableGrinds?: any;
    availableGrams?: any;
    defaultGramsId?: string;
    defaultDuration?: number;
    defaultPeriod?: number;
  }) {
    return this.prisma.subPlan.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description || '',
        image: data.image || null,
        monthlyWeight: data.monthlyWeight || 250,
        priceMonthly: data.priceMonthly,
        discountPercent: data.discountPercent || 0,
        freeShipping: data.freeShipping ?? true,
        isActive: data.isActive ?? true,
        sortOrder: data.sortOrder || 0,
        availableDurations: data.availableDurations ?? undefined,
        availablePeriods: data.availablePeriods ?? undefined,
        availableGrinds: data.availableGrinds ?? undefined,
        availableGrams: data.availableGrams ?? undefined,
        defaultGramsId: data.defaultGramsId ?? null,
        defaultDuration: data.defaultDuration ?? null,
        defaultPeriod: data.defaultPeriod ?? null,
      },
    });
  }

  async updatePlan(id: string, data: Partial<{
    name: string;
    slug: string;
    description: string;
    image: string | null;
    monthlyWeight: number;
    priceMonthly: number;
    discountPercent: number;
    freeShipping: boolean;
    isActive: boolean;
    sortOrder: number;
    availableDurations: any;
    availablePeriods: any;
    availableGrinds: any;
    availableGrams: any;
    defaultGramsId: string | null;
    defaultDuration: number | null;
    defaultPeriod: number | null;
  }>) {
    return this.prisma.subPlan.update({
      where: { id },
      data,
    });
  }

  async deletePlan(id: string) {
    const plan = await this.prisma.subPlan.findUnique({
      where: { id },
      include: { _count: { select: { subscriptions: true } } },
    });
    if (plan && plan._count.subscriptions > 0) {
      // Don't delete, just deactivate
      return this.prisma.subPlan.update({
        where: { id },
        data: { isActive: false },
      });
    }
    return this.prisma.subPlan.delete({ where: { id } });
  }

  // ══════════════════════════════════════════════
  // SUBSCRIBE — İlk Abone Olma
  // ══════════════════════════════════════════════

  /**
   * 1. Plan seç
   * 2. PayTR/iyzico ile İLK ödeme başlat (3D Secure)
   * 3. Checkout session döndür (iframe/form)
   * 4. Webhook gelince → completeSubscription çağrılır
   */
  async subscribe(
    userId: string,
    planId: string,
    grindPreference: GrindType | undefined,
    paymentMethod: PaymentMethod,
  ) {
    const plan = await this.getPlanById(planId);

    // Aktif abonelik kontrolü
    const existing = await this.prisma.subscription.findFirst({
      where: {
        userId,
        status: { in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.PAUSED] },
      },
    });
    if (existing) {
      throw new BadRequestException(
        'Zaten aktif bir aboneliğiniz var. Önce iptal edin veya plan değiştirin.',
      );
    }

    // Abonelik kaydı oluştur (PENDING olarak — ödeme gelince ACTIVE olacak)
    const nextBillingDate = new Date();
    nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

    const subscription = await this.prisma.subscription.create({
      data: {
        userId,
        planId,
        grindPreference,
        status: SubscriptionStatus.PAST_DUE, // İlk ödeme bekliyor
        nextBillingDate,
      },
    });

    // İlk ödeme için sipariş oluştur
    const order = await this.createSubscriptionOrder(userId, plan, grindPreference, subscription.id);

    // Payment checkout session başlat
    const checkout = await this.paymentService.createCheckoutSession(order.id, paymentMethod);

    // Subscription ID'yi payment'a bağla (webhook'ta kullanmak için)
    await this.prisma.payment.update({
      where: { id: checkout.paymentId },
      data: {
        providerData: {
          ...(typeof checkout === 'object' ? checkout : {}),
          subscriptionId: subscription.id,
          isSubscriptionPayment: true,
          cycleNumber: 1,
        },
      },
    });

    return {
      subscriptionId: subscription.id,
      checkout,
      plan: {
        name: plan.name,
        priceMonthly: plan.priceMonthly,
        monthlyWeight: plan.monthlyWeight,
      },
      message: 'Ödeme sayfasına yönlendiriliyorsunuz...',
    };
  }

  /**
   * Webhook'tan ödeme onayı geldiğinde çağrılır
   * PayTR/iyzico webhook handler'dan tetiklenir
   */
  async completeSubscription(
    subscriptionId: string,
    paymentToken: string | null,
    cardLast4: string | null,
    cardBrand: string | null,
    provider: string,
  ) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { plan: true, user: true },
    });

    if (!subscription) {
      this.logger.error(`Subscription not found: ${subscriptionId}`);
      return;
    }

    // Token'ı encrypt ederek sakla
    const encryptedToken = paymentToken
      ? this.encryptionService.encrypt(paymentToken)
      : null;

    await this.prisma.$transaction(async (tx) => {
      // Subscription'ı aktifle
      await tx.subscription.update({
        where: { id: subscriptionId },
        data: {
          status: SubscriptionStatus.ACTIVE,
          paymentProvider: provider,
          paymentToken: encryptedToken,
          cardLast4,
          cardBrand,
          failedRetryCount: 0,
          lastPaymentError: null,
        },
      });

      // İlk cycle'ı kaydet
      await tx.subscriptionCycle.create({
        data: {
          subscriptionId,
          cycleNumber: 1,
          billingDate: new Date(),
          amount: subscription.plan.priceMonthly,
          status: 'paid',
        },
      });
    });

    // Hoş geldin email'i
    try {
      await this.notificationService.sendInApp(
        subscription.userId,
        'Aboneliğiniz Aktif! ☕',
        `${subscription.plan.name} planınız başarıyla aktifleştirildi. Her ay ${subscription.plan.monthlyWeight}g taze kahve kapınızda!`,
        'subscription',
        '/subscriptions',
      );
    } catch (e) {
      this.logger.warn('Failed to send subscription welcome notification', e);
    }

    this.logger.log(
      `Subscription activated: ${subscriptionId} for user ${subscription.userId}`,
    );
  }

  /**
   * Ödeme başarısız olduğunda
   */
  async handleSubscriptionPaymentFailed(subscriptionId: string, error: string) {
    await this.prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: SubscriptionStatus.PAST_DUE,
        lastPaymentError: error,
      },
    });
  }

  // ══════════════════════════════════════════════
  // RECURRING — Aylık Yenileme (Cron Job)
  // ══════════════════════════════════════════════

  /**
   * Cron: Her gün 08:00
   * nextBillingDate <= bugün olan ACTIVE abonelikleri bul ve ödeme al
   */
  async processRenewals(): Promise<{
    processed: number;
    succeeded: number;
    failed: number;
    errors: string[];
  }> {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const dueSubscriptions = await this.prisma.subscription.findMany({
      where: {
        status: SubscriptionStatus.ACTIVE,
        nextBillingDate: { lte: today },
        paymentToken: { not: null },
      },
      include: { plan: true, user: true },
    });

    const result = { processed: 0, succeeded: 0, failed: 0, errors: [] as string[] };

    for (const sub of dueSubscriptions) {
      result.processed++;
      try {
        await this.renewSingleSubscription(sub);
        result.succeeded++;
      } catch (error) {
        result.failed++;
        result.errors.push(`${sub.id}: ${String(error)}`);
        this.logger.error(`Renewal failed for ${sub.id}:`, error);
      }
    }

    this.logger.log(
      `Subscription renewals: ${result.processed} processed, ${result.succeeded} succeeded, ${result.failed} failed`,
    );

    return result;
  }

  /**
   * Tek bir aboneliği yenile
   */
  private async renewSingleSubscription(subscription: any) {
    // Token'ı decrypt et
    const paymentToken = subscription.paymentToken
      ? this.encryptionService.decrypt(subscription.paymentToken)
      : null;

    if (!paymentToken) {
      throw new Error('Payment token not found');
    }

    // Cycle numarası
    const lastCycle = await this.prisma.subscriptionCycle.findFirst({
      where: { subscriptionId: subscription.id },
      orderBy: { cycleNumber: 'desc' },
    });
    const nextCycleNumber = (lastCycle?.cycleNumber || 0) + 1;

    // Plan değişikliği var mı?
    let activePlan = subscription.plan;
    if (subscription.pendingPlanId) {
      activePlan = await this.prisma.subPlan.findUnique({
        where: { id: subscription.pendingPlanId },
      });
      if (!activePlan) activePlan = subscription.plan;
    }

    try {
      // Payment provider ile ödeme çek
      const paymentResult = await this.chargeRecurring(
        subscription,
        paymentToken,
        Number(activePlan.priceMonthly),
      );

      // Başarılı — transaction ile güncelle
      const nextBilling = new Date();
      nextBilling.setMonth(nextBilling.getMonth() + 1);

      await this.prisma.$transaction(async (tx) => {
        // Cycle kaydet
        await tx.subscriptionCycle.create({
          data: {
            subscriptionId: subscription.id,
            cycleNumber: nextCycleNumber,
            billingDate: new Date(),
            amount: activePlan.priceMonthly,
            status: 'paid',
            paymentId: paymentResult.paymentId,
          },
        });

        // Subscription güncelle
        const updateData: any = {
          nextBillingDate: nextBilling,
          failedRetryCount: 0,
          lastPaymentError: null,
          nextRetryDate: null,
        };

        // Plan değişikliği uygula
        if (subscription.pendingPlanId && activePlan) {
          updateData.planId = activePlan.id;
          updateData.pendingPlanId = null;
        }

        await tx.subscription.update({
          where: { id: subscription.id },
          data: updateData,
        });

        // Otomatik sipariş oluştur
        await this.createSubscriptionOrder(
          subscription.userId,
          activePlan,
          subscription.grindPreference,
          subscription.id,
        );
      });

      // Bildirim
      try {
        await this.notificationService.sendInApp(
          subscription.userId,
          'Abonelik Yenilendi ☕',
          `${activePlan.name} planınız yenilendi. Siparişiniz hazırlanıyor!`,
          'subscription',
          '/subscriptions',
        );
      } catch (_) {}

      this.logger.log(
        `Subscription renewed: ${subscription.id} cycle #${nextCycleNumber}`,
      );
    } catch (error) {
      // Ödeme başarısız
      await this.handleRenewalFailure(subscription, String(error));
      throw error;
    }
  }

  /**
   * Ödeme sağlayıcısı ile recurring çekim
   */
  private async chargeRecurring(
    subscription: any,
    paymentToken: string,
    amount: number,
  ): Promise<{ paymentId: string; success: boolean }> {
    const provider = subscription.paymentProvider;

    if (provider === 'paytr') {
      return this.chargePayTRRecurring(subscription, paymentToken, amount);
    } else if (provider === 'iyzico') {
      return this.chargeIyzicoRecurring(subscription, paymentToken, amount);
    }

    throw new Error(`Unknown payment provider: ${provider}`);
  }

  /**
   * PayTR recurring ödeme
   * https://dev.paytr.com/iframe-api/tekrarlayan-odeme
   */
  private async chargePayTRRecurring(
    subscription: any,
    paymentToken: string,
    amount: number,
  ): Promise<{ paymentId: string; success: boolean }> {
    const merchantId = this.config.get<string>('paytr.merchantId');
    const merchantKey = this.config.get<string>('paytr.merchantKey');
    const merchantSalt = this.config.get<string>('paytr.merchantSalt');

    if (!merchantId || !merchantKey || !merchantSalt) {
      throw new Error('PayTR credentials not configured');
    }

    const paymentAmount = Math.round(amount * 100); // Kuruş
    const merchantOid = `SUB-${subscription.id}-${Date.now()}`;

    const hashStr =
      merchantId + paymentToken + paymentAmount + merchantSalt;

    const paytrTokenHash = require('crypto')
      .createHmac('sha256', merchantKey + merchantSalt)
      .update(hashStr)
      .digest('base64');

    try {
      const response = await fetch(
        'https://www.paytr.com/odeme/api/charge',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            merchant_id: merchantId,
            utoken: paymentToken,
            merchant_oid: merchantOid,
            payment_amount: String(paymentAmount),
            currency: 'TL',
            paytr_token: paytrTokenHash,
            test_mode: this.config.get('paytr.testMode') === 'true' ? '1' : '0',
          }).toString(),
        },
      );

      const result = await response.json();

      if (result.status === 'success') {
        // Payment kaydı oluştur
        const payment = await this.prisma.payment.create({
          data: {
            orderId: merchantOid, // temp, order oluşunca güncellenir
            amount,
            currency: 'TRY',
            method: 'CREDIT_CARD' as any,
            status: 'COMPLETED' as any,
            paidAt: new Date(),
            providerPaymentId: result.merchant_oid || merchantOid,
            providerData: result,
          },
        });

        return { paymentId: payment.id, success: true };
      } else {
        throw new Error(`PayTR recurring charge failed: ${result.err_msg || 'Unknown error'}`);
      }
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('PayTR')) throw error;
      throw new Error(`PayTR API error: ${String(error)}`);
    }
  }

  /**
   * iyzico recurring ödeme
   * https://dev.iyzipay.com/tr/api/abonelik-ile-odeme
   */
  private async chargeIyzicoRecurring(
    subscription: any,
    paymentToken: string,
    amount: number,
  ): Promise<{ paymentId: string; success: boolean }> {
    const apiKey = this.config.get<string>('iyzico.apiKey');
    const secretKey = this.config.get<string>('iyzico.secretKey');
    const baseUrl = this.config.get<string>('iyzico.baseUrl') || 'https://sandbox-api.iyzipay.com';

    if (!apiKey || !secretKey) {
      throw new Error('iyzico credentials not configured');
    }

    const conversationId = `SUB-${subscription.id}-${Date.now()}`;
    const price = amount.toFixed(2);

    const requestBody = {
      locale: 'tr',
      conversationId,
      price,
      paidPrice: price,
      currency: 'TRY',
      paymentCard: {
        cardToken: paymentToken,
        cardUserKey: subscription.userId,
      },
      buyer: {
        id: subscription.userId,
        name: subscription.user?.firstName || 'Abone',
        surname: subscription.user?.lastName || 'Kullanıcı',
        email: subscription.user?.email || 'abone@olentia.com',
        identityNumber: '11111111111',
        registrationAddress: 'Türkiye',
        ip: '127.0.0.1',
        city: 'Istanbul',
        country: 'Turkey',
      },
      basketItems: [
        {
          id: subscription.planId,
          name: `${subscription.plan.name} Abonelik`,
          category1: 'Abonelik',
          itemType: 'VIRTUAL',
          price,
        },
      ],
    };

    const crypto = require('crypto');
    const randomString = crypto.randomBytes(8).toString('hex').substring(0, 8);
    const jsonString = JSON.stringify(requestBody);
    const hashString = randomString + jsonString;
    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(hashString)
      .digest('base64');
    const authString = `IYZWS ${Buffer.from(`apiKey:${apiKey}&randomKey:${randomString}&signature:${signature}`).toString('base64')}`;

    try {
      const response = await fetch(`${baseUrl}/payment/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authString,
          'x-iyzi-rnd': randomString,
        },
        body: jsonString,
      });

      const result = await response.json();

      if (result.status === 'success') {
        const payment = await this.prisma.payment.create({
          data: {
            orderId: conversationId,
            amount,
            currency: 'TRY',
            method: 'CREDIT_CARD' as any,
            status: 'COMPLETED' as any,
            paidAt: new Date(),
            providerPaymentId: result.paymentId,
            providerData: result,
          },
        });

        return { paymentId: payment.id, success: true };
      } else {
        throw new Error(`iyzico recurring charge failed: ${result.errorMessage || 'Unknown error'}`);
      }
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('iyzico')) throw error;
      throw new Error(`iyzico API error: ${String(error)}`);
    }
  }

  // ══════════════════════════════════════════════
  // RETRY — Başarısız Ödeme Tekrar Deneme
  // ══════════════════════════════════════════════

  /**
   * Cron: Her gün 10:00
   * Başarısız ödemeleri retry et (1, 3, 5 gün sonra)
   */
  async processRetries(): Promise<{
    processed: number;
    succeeded: number;
    suspended: number;
  }> {
    const now = new Date();

    const retryable = await this.prisma.subscription.findMany({
      where: {
        status: SubscriptionStatus.PAST_DUE,
        nextRetryDate: { lte: now },
        failedRetryCount: { lt: 3 },
        paymentToken: { not: null },
      },
      include: { plan: true, user: true },
    });

    const result = { processed: 0, succeeded: 0, suspended: 0 };

    for (const sub of retryable) {
      result.processed++;
      try {
        await this.renewSingleSubscription(sub);
        result.succeeded++;

        // Başarılı oldu — ACTIVE'e döndür
        await this.prisma.subscription.update({
          where: { id: sub.id },
          data: { status: SubscriptionStatus.ACTIVE },
        });
      } catch (_) {
        // Hala başarısız
        if (sub.failedRetryCount >= 2) {
          // 3. deneme de başarısız → SUSPENDED
          await this.prisma.subscription.update({
            where: { id: sub.id },
            data: {
              status: SubscriptionStatus.SUSPENDED,
              suspendedAt: new Date(),
            },
          });

          try {
            await this.notificationService.sendInApp(
              sub.userId,
              'Aboneliğiniz Askıya Alındı ⚠️',
              'Ödeme 3 kez başarısız oldu. Aboneliğiniz askıya alındı. Lütfen ödeme yönteminizi güncelleyin.',
              'subscription_suspended',
              '/subscriptions',
            );
          } catch (_) {}

          result.suspended++;
          this.logger.warn(`Subscription suspended: ${sub.id}`);
        }
      }
    }

    return result;
  }

  private async handleRenewalFailure(subscription: any, error: string) {
    const retryCount = subscription.failedRetryCount + 1;
    const retryDays = [1, 3, 5]; // 1. deneme +1 gün, 2. deneme +3 gün, 3. deneme +5 gün
    const nextRetryDays = retryDays[retryCount - 1] || 5;

    const nextRetryDate = new Date();
    nextRetryDate.setDate(nextRetryDate.getDate() + nextRetryDays);

    await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: SubscriptionStatus.PAST_DUE,
        failedRetryCount: retryCount,
        lastPaymentError: error.substring(0, 500),
        nextRetryDate: retryCount < 3 ? nextRetryDate : null,
      },
    });

    // Cycle'a başarısız kayıt
    const lastCycle = await this.prisma.subscriptionCycle.findFirst({
      where: { subscriptionId: subscription.id },
      orderBy: { cycleNumber: 'desc' },
    });

    await this.prisma.subscriptionCycle.create({
      data: {
        subscriptionId: subscription.id,
        cycleNumber: (lastCycle?.cycleNumber || 0) + 1,
        billingDate: new Date(),
        amount: subscription.plan.priceMonthly,
        status: 'failed',
      },
    });

    // Kullanıcıyı bilgilendir
    try {
      await this.notificationService.sendInApp(
        subscription.userId,
        'Ödeme Başarısız ⚠️',
        `Abonelik ödemeniz alınamadı. ${retryCount < 3 ? `${nextRetryDays} gün sonra tekrar denenecek.` : 'Lütfen ödeme yönteminizi güncelleyin.'}`,
        'payment_failed',
        '/subscriptions',
      );
    } catch (_) {}

    this.logger.warn(
      `Subscription payment failed: ${subscription.id} (retry ${retryCount}/3, next retry: ${nextRetryDate})`,
    );
  }

  // ══════════════════════════════════════════════
  // HATIRLATMA — 3 gün öncesi email
  // ══════════════════════════════════════════════

  /**
   * Cron: Her gün 09:00
   * 3 gün sonra yenilenecek aboneliklere hatırlatma
   */
  async sendRenewalReminders(): Promise<number> {
    const threeDaysLater = new Date();
    threeDaysLater.setDate(threeDaysLater.getDate() + 3);

    const startOfDay = new Date(threeDaysLater);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(threeDaysLater);
    endOfDay.setHours(23, 59, 59, 999);

    const upcoming = await this.prisma.subscription.findMany({
      where: {
        status: SubscriptionStatus.ACTIVE,
        nextBillingDate: { gte: startOfDay, lte: endOfDay },
      },
      include: { plan: true, user: true },
    });

    for (const sub of upcoming) {
      try {
        await this.notificationService.sendInApp(
          sub.userId,
          'Abonelik Yenileme Hatırlatması 📅',
          `${sub.plan.name} planınız 3 gün sonra yenilenecek. Tutar: ₺${sub.plan.priceMonthly}`,
          'subscription_reminder',
          '/subscriptions',
        );
      } catch (_) {}
    }

    this.logger.log(`Sent ${upcoming.length} renewal reminders`);
    return upcoming.length;
  }

  // ══════════════════════════════════════════════
  // PLAN DEĞİŞTİRME
  // ══════════════════════════════════════════════

  async changePlan(
    subscriptionId: string,
    userId: string,
    newPlanId: string,
    timing: 'immediate' | 'end_of_period' = 'end_of_period',
  ) {
    const subscription = await this.getSubscriptionForUser(subscriptionId, userId);
    const newPlan = await this.getPlanById(newPlanId);
    const currentPlan = await this.getPlanById(subscription.planId);

    if (newPlanId === subscription.planId) {
      throw new BadRequestException('Zaten bu planda abonesiniz');
    }

    if (timing === 'immediate') {
      // Hemen uygula — proration hesapla
      const today = new Date();
      const nextBilling = new Date(subscription.nextBillingDate);
      const totalDays = 30; // Basitlik için 30 gün
      const remainingDays = Math.max(
        0,
        Math.ceil((nextBilling.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
      );

      const currentDailyRate = Number(currentPlan.priceMonthly) / totalDays;
      const newDailyRate = Number(newPlan.priceMonthly) / totalDays;
      const credit = currentDailyRate * remainingDays;
      const charge = newDailyRate * remainingDays;
      const prorationAmount = Math.max(0, charge - credit);

      await this.prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
          planId: newPlanId,
          pendingPlanId: null,
        },
      });

      return {
        message: 'Plan hemen değiştirildi',
        previousPlan: currentPlan.name,
        newPlan: newPlan.name,
        proration: {
          remainingDays,
          credit: credit.toFixed(2),
          charge: charge.toFixed(2),
          difference: prorationAmount.toFixed(2),
        },
      };
    } else {
      // Dönem sonunda uygula
      await this.prisma.subscription.update({
        where: { id: subscriptionId },
        data: { pendingPlanId: newPlanId },
      });

      return {
        message: `Plan dönem sonunda ${newPlan.name} olarak değişecek`,
        currentPlan: currentPlan.name,
        pendingPlan: newPlan.name,
        effectiveDate: subscription.nextBillingDate,
      };
    }
  }

  async cancelPlanChange(subscriptionId: string, userId: string) {
    await this.getSubscriptionForUser(subscriptionId, userId);

    await this.prisma.subscription.update({
      where: { id: subscriptionId },
      data: { pendingPlanId: null },
    });

    return { message: 'Plan değişikliği iptal edildi' };
  }

  // ══════════════════════════════════════════════
  // KART GÜNCELLEME
  // ══════════════════════════════════════════════

  async updatePaymentMethod(
    subscriptionId: string,
    userId: string,
    paymentToken: string,
    cardLast4: string,
    cardBrand: string,
    provider?: string,
  ) {
    const subscription = await this.getSubscriptionForUser(subscriptionId, userId);

    const encryptedToken = this.encryptionService.encrypt(paymentToken);

    const updateData: any = {
      paymentToken: encryptedToken,
      cardLast4,
      cardBrand,
      lastPaymentError: null,
    };

    if (provider) {
      updateData.paymentProvider = provider;
    }

    // SUSPENDED ise, kart güncellenince PAST_DUE'ya çevir (retry başlasın)
    if (subscription.status === SubscriptionStatus.SUSPENDED) {
      const nextRetry = new Date();
      nextRetry.setHours(nextRetry.getHours() + 1); // 1 saat sonra dene

      updateData.status = SubscriptionStatus.PAST_DUE;
      updateData.failedRetryCount = 0;
      updateData.nextRetryDate = nextRetry;
      updateData.suspendedAt = null;
    }

    await this.prisma.subscription.update({
      where: { id: subscriptionId },
      data: updateData,
    });

    return {
      message: 'Ödeme yöntemi güncellendi',
      cardLast4,
      cardBrand,
      willRetry: subscription.status === SubscriptionStatus.SUSPENDED,
    };
  }

  // ══════════════════════════════════════════════
  // ÖĞÜTME TERCİHİ DEĞİŞTİRME
  // ══════════════════════════════════════════════

  async updateGrindPreference(
    subscriptionId: string,
    userId: string,
    grindPreference: GrindType,
  ) {
    await this.getSubscriptionForUser(subscriptionId, userId);

    await this.prisma.subscription.update({
      where: { id: subscriptionId },
      data: { grindPreference },
    });

    return { message: 'Öğütme tercihi güncellendi', grindPreference };
  }

  // ══════════════════════════════════════════════
  // PAUSE / RESUME / CANCEL
  // ══════════════════════════════════════════════

  async pauseForUser(id: string, userId: string) {
    const subscription = await this.getSubscriptionForUser(id, userId);

    if (subscription.status !== SubscriptionStatus.ACTIVE) {
      throw new BadRequestException('Sadece aktif abonelikler duraklatılabilir');
    }

    await this.prisma.subscription.update({
      where: { id },
      data: { status: SubscriptionStatus.PAUSED, pausedAt: new Date() },
    });

    return { message: 'Abonelik duraklatıldı. Devam ettirene kadar ödeme alınmayacak.' };
  }

  async resumeForUser(id: string, userId: string) {
    const subscription = await this.getSubscriptionForUser(id, userId);

    if (subscription.status !== SubscriptionStatus.PAUSED) {
      throw new BadRequestException('Sadece duraklatılmış abonelikler devam ettirilebilir');
    }

    // nextBillingDate'i bugünden itibaren 1 ay sonraya ayarla
    const nextBillingDate = new Date();
    nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

    await this.prisma.subscription.update({
      where: { id },
      data: {
        status: SubscriptionStatus.ACTIVE,
        pausedAt: null,
        nextBillingDate,
      },
    });

    return {
      message: 'Abonelik devam ettirildi',
      nextBillingDate,
    };
  }

  async cancelForUser(id: string, userId: string) {
    const subscription = await this.getSubscriptionForUser(id, userId);

    if (subscription.status === SubscriptionStatus.CANCELLED || subscription.status === SubscriptionStatus.EXPIRED) {
      throw new BadRequestException('Abonelik zaten iptal edilmiş');
    }

    await this.prisma.subscription.update({
      where: { id },
      data: {
        status: SubscriptionStatus.CANCELLED,
        cancelledAt: new Date(),
        pendingPlanId: null,
      },
    });

    try {
      await this.notificationService.sendInApp(
        userId,
        'Abonelik İptal Edildi',
        'Aboneliğiniz iptal edildi. Mevcut dönem sonuna kadar hizmet devam edecektir.',
        'subscription_cancelled',
        '/subscriptions',
      );
    } catch (_) {}

    return {
      message: 'Abonelik iptal edildi. Dönem sonuna kadar aktif kalacaktır.',
      activeUntil: subscription.nextBillingDate,
    };
  }

  // ══════════════════════════════════════════════
  // KULLANICI SORGULARI
  // ══════════════════════════════════════════════

  async getUserSubscriptions(userId: string) {
    const subscriptions = await this.prisma.subscription.findMany({
      where: { userId },
      include: {
        plan: true,
        pendingPlan: true,
        cycles: { orderBy: { cycleNumber: 'desc' }, take: 5 },
      },
      orderBy: { createdAt: 'desc' },
    });

    return subscriptions.map((sub) => ({
      ...sub,
      paymentToken: undefined, // Token'ı asla dönme
      cardInfo: sub.cardLast4
        ? { last4: sub.cardLast4, brand: sub.cardBrand }
        : null,
    }));
  }

  async getSubscriptionDetail(subscriptionId: string, userId: string) {
    const subscription = await this.getSubscriptionForUser(subscriptionId, userId);

    const allCycles = await this.prisma.subscriptionCycle.findMany({
      where: { subscriptionId },
      orderBy: { cycleNumber: 'desc' },
    });

    const totalSpent = allCycles
      .filter((c) => c.status === 'paid')
      .reduce((sum, c) => sum + Number(c.amount), 0);

    return {
      ...subscription,
      paymentToken: undefined,
      cardInfo: subscription.cardLast4
        ? { last4: subscription.cardLast4, brand: subscription.cardBrand }
        : null,
      cycles: allCycles,
      stats: {
        totalCycles: allCycles.length,
        paidCycles: allCycles.filter((c) => c.status === 'paid').length,
        failedCycles: allCycles.filter((c) => c.status === 'failed').length,
        totalSpent: totalSpent.toFixed(2),
      },
    };
  }

  // ══════════════════════════════════════════════
  // ADMIN
  // ══════════════════════════════════════════════

  async findAll(page = 1, limit = 20, status?: string) {
    const safeLimit = Math.min(limit, 100);
    const where: any = {};
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.subscription.findMany({
        where,
        include: {
          user: {
            select: { id: true, email: true, firstName: true, lastName: true },
          },
          plan: true,
          pendingPlan: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * safeLimit,
        take: safeLimit,
      }),
      this.prisma.subscription.count({ where }),
    ]);

    return {
      data: data.map((sub) => ({ ...sub, paymentToken: undefined })),
      meta: { total, page, limit: safeLimit, totalPages: Math.ceil(total / safeLimit) },
    };
  }

  async getSubscriptionStats() {
    const [total, byStatus, revenue] = await Promise.all([
      this.prisma.subscription.count(),
      this.prisma.subscription.groupBy({
        by: ['status'],
        _count: true,
      }),
      this.prisma.subscriptionCycle.aggregate({
        where: { status: 'paid' },
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    const mrr = await this.prisma.subscription.aggregate({
      where: { status: SubscriptionStatus.ACTIVE },
      _count: true,
    });

    // Ortalama plan fiyatı ile MRR hesapla
    const activeWithPlan = await this.prisma.subscription.findMany({
      where: { status: SubscriptionStatus.ACTIVE },
      include: { plan: { select: { priceMonthly: true } } },
    });

    const monthlyRecurring = activeWithPlan.reduce(
      (sum, s) => sum + Number(s.plan.priceMonthly),
      0,
    );

    return {
      total,
      byStatus: byStatus.map((s) => ({ status: s.status, count: s._count })),
      activeCount: mrr._count,
      mrr: monthlyRecurring.toFixed(2), // Monthly Recurring Revenue
      arr: (monthlyRecurring * 12).toFixed(2), // Annual Recurring Revenue
      totalRevenue: Number(revenue._sum.amount || 0).toFixed(2),
      totalCyclesPaid: revenue._count,
    };
  }

  // ══════════════════════════════════════════════
  // PRIVATE HELPERS
  // ══════════════════════════════════════════════

  private async getSubscriptionForUser(subscriptionId: string, userId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { plan: true, pendingPlan: true },
    });

    if (!subscription) throw new NotFoundException('Abonelik bulunamadı');
    if (subscription.userId !== userId) {
      throw new NotFoundException('Abonelik bulunamadı');
    }

    return subscription;
  }

  private async createSubscriptionOrder(
    userId: string,
    plan: any,
    grindPreference: GrindType | null | undefined,
    subscriptionId: string,
  ) {
    // Plan'a uygun ürünü bul (veya varsayılan kahve ürünü)
    const product = await this.prisma.product.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
    });

    if (!product) {
      this.logger.warn('No product found for subscription order');
      throw new Error('Ürün bulunamadı');
    }

    // Kullanıcının varsayılan adresini bul
    const address = await this.prisma.address.findFirst({
      where: { userId, isDefault: true },
    });

    if (!address) {
      // Herhangi bir adresi al
      const anyAddress = await this.prisma.address.findFirst({
        where: { userId },
      });
      if (!anyAddress) {
        throw new Error('Kullanıcının kayıtlı adresi bulunamadı. Lütfen önce bir adres ekleyin.');
      }
    }

    const addressId = address?.id || (await this.prisma.address.findFirst({ where: { userId } }))!.id;

    const orderNumber = `SUB-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const order = await this.prisma.order.create({
      data: {
        orderNumber,
        userId,
        addressId,
        status: 'CONFIRMED',
        total: plan.priceMonthly,
        subtotal: plan.priceMonthly,
        tax: 0,
        shippingCost: 0, // Aboneliklerde kargo bedava
        note: `Abonelik siparişi — ${plan.name} (${plan.monthlyWeight}g)${grindPreference ? ` — ${grindPreference}` : ''}`,
        items: {
          create: {
            productId: product.id,
            productName: `${plan.name} — ${plan.monthlyWeight}g Kahve`,
            quantity: 1,
            unitPrice: plan.priceMonthly,
            totalPrice: plan.priceMonthly,
          },
        },
      },
    });

    return order;
  }
}
