import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { PaymentMethod, PaymentStatus } from '@prisma/client';
import * as crypto from 'crypto';

// Callback type for subscription payment completion
export type SubscriptionPaymentCallback = (
  subscriptionId: string,
  paymentToken: string | null,
  cardLast4: string | null,
  cardBrand: string | null,
  provider: string,
) => Promise<void>;

export type SubscriptionPaymentFailedCallback = (
  subscriptionId: string,
  error: string,
) => Promise<void>;

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  // Subscription callback — set by SubscriptionService on init
  private onSubscriptionPaymentComplete?: SubscriptionPaymentCallback;
  private onSubscriptionPaymentFailed?: SubscriptionPaymentFailedCallback;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  /**
   * Register callback for subscription payment events.
   * Called by SubscriptionService.onModuleInit()
   */
  registerSubscriptionCallbacks(
    onComplete: SubscriptionPaymentCallback,
    onFailed: SubscriptionPaymentFailedCallback,
  ) {
    this.onSubscriptionPaymentComplete = onComplete;
    this.onSubscriptionPaymentFailed = onFailed;
    this.logger.log('Subscription payment callbacks registered');
  }

  // ══════════════════════════════════════════════
  // CHECKOUT SESSION
  // ══════════════════════════════════════════════

  async createCheckoutSession(orderId: string, method: PaymentMethod, userIp?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true, address: true, items: true },
    });

    if (!order) throw new BadRequestException('Sipariş bulunamadı');

    // Create payment record
    const payment = await this.prisma.payment.create({
      data: {
        orderId,
        amount: order.total,
        currency: 'TRY',
        method,
        status: PaymentStatus.PENDING,
      },
    });

    await this.logPayment(payment.id, 'checkout.init', { method, orderId });

    // Route to correct provider
    switch (method) {
      case PaymentMethod.CREDIT_CARD:
      case PaymentMethod.DEBIT_CARD:
        return this.initPayTR(payment, order, userIp);
      case PaymentMethod.QR_CODE:
        return this.initQRPayment(payment, order);
      default:
        return this.initPayTR(payment, order, userIp);
    }
  }

  // ══════════════════════════════════════════════
  // PAYTR INTEGRATION
  // https://dev.paytr.com/iframe-api
  // ══════════════════════════════════════════════

  private async initPayTR(payment: any, order: any, requestIp?: string) {
    const merchantId = this.config.get<string>('paytr.merchantId');
    const merchantKey = this.config.get<string>('paytr.merchantKey');
    const merchantSalt = this.config.get<string>('paytr.merchantSalt');

    if (!merchantId || !merchantKey || !merchantSalt) {
      this.logger.error('PayTR credentials not configured');
      throw new BadRequestException(
        'Ödeme servisi yapılandırılmamış. Lütfen yönetici ile iletişime geçin.',
      );
    }

    // Kullanıcı bilgileri
    const userEmail = order.user?.email || 'guest@olentia.com';
    const userName =
      `${order.user?.firstName || 'Guest'} ${order.user?.lastName || ''}`.trim();
    const userPhone = order.user?.phone || '05000000000';
    const userAddress = order.address
      ? `${order.address.line1 || ''} ${order.address.district || ''} ${order.address.city || ''}`.trim() || 'Türkiye'
      : 'Türkiye';

    // Sipariş bilgileri
    const merchantOid = payment.id;
    const paymentAmount = Math.round(Number(order.total) * 100); // Kuruş cinsinden
    const currency = 'TL';
    const testMode = this.config.get('paytr.testMode') === 'true' ? '1' : '0';
    const noInstallment = '0';
    const maxInstallment = '12';

    // Sepet (base64 JSON)
    const basket = order.items.map((item: any) => [
      item.productName || 'Ürün',
      Number(item.unitPrice).toFixed(2),
      String(item.quantity),
    ]);
    const userBasket = Buffer.from(JSON.stringify(basket)).toString('base64');

    // Callback URLs
    const merchantOkUrl = `${this.config.get('app.frontendUrl')}/odeme/basarili`;
    const merchantFailUrl = `${this.config.get('app.frontendUrl')}/odeme/basarisiz`;

    const userIp = this.normalizePayTRIp(requestIp);

    // Debug mode
    const debugOn = testMode === '1' ? '1' : '0';
    const lang = 'tr';
    const timeout = '30';

    // HMAC Token oluştur
    // Format: merchantId + userIp + merchantOid + email + paymentAmount + userBasket + noInstallment + maxInstallment + currency + testMode
    const hashStr =
      merchantId +
      userIp +
      merchantOid +
      userEmail +
      paymentAmount +
      userBasket +
      noInstallment +
      maxInstallment +
      currency +
      testMode;

    const paytrToken = this.generatePayTRToken(
      hashStr,
      merchantKey,
      merchantSalt,
    );

    // PayTR API'ye POST
    const postData = {
      merchant_id: merchantId,
      user_ip: userIp,
      merchant_oid: merchantOid,
      email: userEmail,
      payment_amount: paymentAmount,
      paytr_token: paytrToken,
      user_basket: userBasket,
      debug_on: debugOn,
      no_installment: noInstallment,
      max_installment: maxInstallment,
      user_name: userName,
      user_address: userAddress,
      user_phone: userPhone,
      merchant_ok_url: merchantOkUrl,
      merchant_fail_url: merchantFailUrl,
      timeout_limit: timeout,
      currency: currency,
      test_mode: testMode,
      lang: lang,
    };

    try {
      const response = await fetch(
        'https://www.paytr.com/odeme/api/get-token',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams(postData as any).toString(),
        },
      );

      const rawBody = await response.text();
      let result: any;
      try {
        result = rawBody ? JSON.parse(rawBody) : null;
      } catch {
        this.logger.error(`PayTR non-JSON response (${response.status}): ${rawBody.slice(0, 300)}`);
        throw new Error(`PayTR returned non-JSON response with status ${response.status}`);
      }

      if (!response.ok || !result) {
        this.logger.error(`PayTR HTTP error (${response.status}): ${rawBody.slice(0, 300)}`);
        throw new Error(`PayTR HTTP ${response.status}`);
      }

      if (result.status === 'success') {
        await this.logPayment(payment.id, 'paytr.token.success', {
          token: result.token,
        });
        return {
          paymentId: payment.id,
          provider: 'paytr',
          iframeToken: result.token,
          iframeUrl: `https://www.paytr.com/odeme/guvenli/${result.token}`,
        };
      } else {
        this.logger.error('PayTR token error:', result.reason);
        await this.logPayment(payment.id, 'paytr.token.error', result);
        throw new BadRequestException(`Ödeme başlatılamadı: ${result.reason}`);
      }
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error('PayTR API error:', error);
      await this.logPayment(payment.id, 'paytr.api.error', {
        error: String(error),
      });
      throw new BadRequestException(
        'Ödeme servisi şu anda kullanılamıyor. Lütfen tekrar deneyin.',
      );
    }
  }

  private generatePayTRToken(
    hashStr: string,
    merchantKey: string,
    merchantSalt: string,
  ): string {
    const hmac = crypto.createHmac('sha256', merchantKey);
    hmac.update(hashStr + merchantSalt);
    return hmac.digest('base64');
  }

  private normalizePayTRIp(ip?: string): string {
    const raw = String(ip || '').split(',')[0].trim().replace(/^::ffff:/, '');
    if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(raw) && !raw.startsWith('127.') && raw !== '0.0.0.0') {
      return raw;
    }

    // PayTR requires a real IPv4 address; this is only a fallback if proxy headers are absent.
    return '213.159.6.225';
  }

  // ══════════════════════════════════════════════
  // IYZICO INTEGRATION
  // https://dev.iyzipay.com/tr/api/checkout-form
  // ══════════════════════════════════════════════

  async initIyzico(payment: any, order: any) {
    const apiKey = this.config.get<string>('iyzico.apiKey');
    const secretKey = this.config.get<string>('iyzico.secretKey');
    const baseUrl =
      this.config.get<string>('iyzico.baseUrl') ||
      'https://sandbox-api.iyzipay.com';

    if (!apiKey || !secretKey) {
      this.logger.error('iyzico credentials not configured');
      throw new BadRequestException(
        'Ödeme servisi yapılandırılmamış. Lütfen yönetici ile iletişime geçin.',
      );
    }

    // Conversation ID (unique per transaction)
    const conversationId = payment.id;
    const locale = 'tr';
    const price = Number(order.total).toFixed(2);
    const paidPrice = price;
    const currency = 'TRY';
    const basketId = order.orderNumber;
    const paymentGroup = 'PRODUCT';

    // Callback URL
    const callbackUrl = `${this.config.get('app.apiUrl')}/api/webhooks/iyzico`;

    // Buyer info
    const buyer = {
      id: order.userId || 'guest',
      name: order.user?.firstName || 'Guest',
      surname: order.user?.lastName || 'User',
      gsmNumber: order.user?.phone || '+905000000000',
      email: order.user?.email || 'guest@olentia.com',
      identityNumber: '11111111111', // TC Kimlik (test)
      registrationAddress: 'Türkiye',
      ip: '127.0.0.1',
      city: 'Istanbul',
      country: 'Turkey',
    };

    // Shipping & billing address
    const address = {
      contactName: `${buyer.name} ${buyer.surname}`,
      city: 'Istanbul',
      country: 'Turkey',
      address: 'Türkiye',
    };

    // Basket items
    const basketItems = order.items.map((item: any, index: number) => ({
      id: item.productId || `item_${index}`,
      name: item.productName || 'Ürün',
      category1: 'Kahve',
      itemType: 'PHYSICAL',
      price: Number(item.unitPrice * item.quantity).toFixed(2),
    }));

    // Request body
    const requestBody = {
      locale,
      conversationId,
      price,
      paidPrice,
      currency,
      basketId,
      paymentGroup,
      callbackUrl,
      buyer,
      shippingAddress: address,
      billingAddress: address,
      basketItems,
    };

    // Generate authorization header
    const randomString = this.generateRandomString(8);
    const authString = this.generateIyzicoAuth(
      apiKey,
      secretKey,
      randomString,
      requestBody,
    );

    try {
      const response = await fetch(
        `${baseUrl}/payment/iyzipos/checkoutform/initialize`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: authString,
            'x-iyzi-rnd': randomString,
          },
          body: JSON.stringify(requestBody),
        },
      );

      const rawBody = await response.text();
      let result: any;
      try {
        result = rawBody ? JSON.parse(rawBody) : null;
      } catch {
        this.logger.error(`PayTR non-JSON response (${response.status}): ${rawBody.slice(0, 300)}`);
        throw new Error(`PayTR returned non-JSON response with status ${response.status}`);
      }

      if (!response.ok || !result) {
        this.logger.error(`PayTR HTTP error (${response.status}): ${rawBody.slice(0, 300)}`);
        throw new Error(`PayTR HTTP ${response.status}`);
      }

      if (result.status === 'success') {
        await this.logPayment(payment.id, 'iyzico.init.success', {
          token: result.token,
        });
        return {
          paymentId: payment.id,
          provider: 'iyzico',
          checkoutFormContent: result.checkoutFormContent,
          token: result.token,
          tokenExpireTime: result.tokenExpireTime,
        };
      } else {
        this.logger.error('iyzico init error:', result.errorMessage);
        await this.logPayment(payment.id, 'iyzico.init.error', result);
        throw new BadRequestException(
          `Ödeme başlatılamadı: ${result.errorMessage}`,
        );
      }
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error('iyzico API error:', error);
      await this.logPayment(payment.id, 'iyzico.api.error', {
        error: String(error),
      });
      throw new BadRequestException(
        'Ödeme servisi şu anda kullanılamıyor. Lütfen tekrar deneyin.',
      );
    }
  }

  private generateRandomString(length: number): string {
    return crypto.randomBytes(length).toString('hex').substring(0, length);
  }

  private generateIyzicoAuth(
    apiKey: string,
    secretKey: string,
    randomString: string,
    requestBody: any,
  ): string {
    const jsonString = JSON.stringify(requestBody);
    const hashString = randomString + jsonString;
    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(hashString)
      .digest('base64');

    const authorizationString = `apiKey:${apiKey}&randomKey:${randomString}&signature:${signature}`;
    return `IYZWS ${Buffer.from(authorizationString).toString('base64')}`;
  }

  // ══════════════════════════════════════════════
  // QR CODE PAYMENT
  // ══════════════════════════════════════════════

  private async initQRPayment(payment: any, order: any) {
    const qrData = {
      amount: Number(payment.amount),
      orderId: order.orderNumber,
      merchantId: this.config.get('paytr.merchantId'),
      timestamp: Date.now(),
    };

    return {
      paymentId: payment.id,
      provider: 'qr',
      amount: Number(payment.amount),
      currency: payment.currency,
      qrData: Buffer.from(JSON.stringify(qrData)).toString('base64'),
      message: 'QR ödeme kodu oluşturuldu',
    };
  }

  // ══════════════════════════════════════════════
  // GOOGLE PAY
  // ══════════════════════════════════════════════

  async initGooglePay(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) throw new BadRequestException('Sipariş bulunamadı');

    return {
      merchantId: this.config.get('googlePay.merchantId') || 'BCR2DN4T7EXAMPLE',
      merchantName: 'Olentia Pure',
      amount: Number(order.total),
      currency: 'TRY',
      countryCode: 'TR',
      gateway: 'paytr',
      gatewayMerchantId: this.config.get('paytr.merchantId'),
    };
  }

  // ══════════════════════════════════════════════
  // APPLE PAY
  // ══════════════════════════════════════════════

  async initApplePay(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) throw new BadRequestException('Sipariş bulunamadı');

    return {
      merchantIdentifier:
        this.config.get('applePay.merchantId') || 'merchant.com.olentia',
      merchantName: 'Olentia Pure',
      amount: Number(order.total),
      currency: 'TRY',
      countryCode: 'TR',
      supportedNetworks: ['visa', 'masterCard', 'amex'],
      merchantCapabilities: ['supports3DS', 'supportsCredit', 'supportsDebit'],
    };
  }

  // ══════════════════════════════════════════════
  // SECURE METHODS (with ownership check)
  // ══════════════════════════════════════════════

  private async verifyOrderOwnership(orderId: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) throw new BadRequestException('Sipariş bulunamadı');
    if (order.userId !== userId) {
      throw new BadRequestException('Sipariş bulunamadı');
    }
    return order;
  }

  async createCheckoutSessionSecure(
    orderId: string,
    method: PaymentMethod,
    userId: string,
    userIp?: string,
  ) {
    await this.verifyOrderOwnership(orderId, userId);
    return this.createCheckoutSession(orderId, method, userIp);
  }

  async initGooglePaySecure(orderId: string, userId: string) {
    await this.verifyOrderOwnership(orderId, userId);
    return this.initGooglePay(orderId);
  }

  async initApplePaySecure(orderId: string, userId: string) {
    await this.verifyOrderOwnership(orderId, userId);
    return this.initApplePay(orderId);
  }

  // ══════════════════════════════════════════════
  // WEBHOOK HANDLERS
  // ══════════════════════════════════════════════

  async handlePayTRWebhook(data: {
    merchant_oid: string;
    status: string;
    total_amount: string;
    hash: string;
    failed_reason_code?: string;
    failed_reason_msg?: string;
    test_mode?: string;
    payment_type?: string;
    currency?: string;
    payment_amount?: string;
  }) {
    // HMAC doğrulama
    const merchantKey = this.config.get<string>('paytr.merchantKey');
    const merchantSalt = this.config.get<string>('paytr.merchantSalt');

    if (!merchantKey || !merchantSalt) {
      this.logger.error(
        'PayTR webhook credentials not configured — rejecting webhook',
      );
      return { status: 'FAIL' };
    }

    const hashStr =
      data.merchant_oid + merchantSalt + data.status + data.total_amount;
    const expectedHash = crypto
      .createHmac('sha256', merchantKey)
      .update(hashStr)
      .digest('base64');

    if (data.hash !== expectedHash) {
      this.logger.error('PayTR webhook hash mismatch');
      await this.logPayment(
        data.merchant_oid,
        'paytr.webhook.hash_mismatch',
        data,
      );
      return { status: 'FAIL' };
    }

    const payment = await this.prisma.payment.findUnique({
      where: { id: data.merchant_oid },
    });

    if (!payment) {
      this.logger.error(`Payment not found: ${data.merchant_oid}`);
      return { status: 'FAIL' };
    }

    // CRITICAL: Verify that the amount PayTR confirmed matches the expected order amount.
    // PayTR sends total_amount in kuruş (minor units); stored payment.amount is in TRY.
    const expectedAmountKurus = Math.round(Number(payment.amount) * 100);
    const receivedAmountKurus = Number(data.total_amount);
    if (data.status === 'success' && expectedAmountKurus !== receivedAmountKurus) {
      this.logger.error(
        `PayTR amount mismatch! Expected ${expectedAmountKurus}, got ${receivedAmountKurus} for payment ${payment.id}`,
      );
      await this.logPayment(payment.id, 'paytr.webhook.amount_mismatch', {
        expected: expectedAmountKurus,
        received: receivedAmountKurus,
        data,
      });
      return { status: 'FAIL' };
    }

    const newStatus =
      data.status === 'success'
        ? PaymentStatus.COMPLETED
        : PaymentStatus.FAILED;

    // Use transaction for atomic updates
    await this.prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: newStatus,
          paidAt: newStatus === PaymentStatus.COMPLETED ? new Date() : null,
          providerPaymentId: data.merchant_oid,
          providerData: data as any,
        },
      });

      // Sipariş durumunu güncelle
      if (newStatus === PaymentStatus.COMPLETED) {
        await tx.order.update({
          where: { id: payment.orderId },
          data: { status: 'CONFIRMED', paidAt: new Date() },
        });
        this.logger.log(`Payment completed: ${payment.id}`);
      } else {
        // Payment failed - restore stock
        const order = await tx.order.findUnique({
          where: { id: payment.orderId },
          include: { items: true },
        });

        if (order) {
          // Restore stock for each item
          for (const item of order.items) {
            if (item.variantId) {
              await tx.productVariant.update({
                where: { id: item.variantId },
                data: { stock: { increment: item.quantity } },
              });
            } else if (item.productId) {
              // Ürün silinmiş olabilir (productId null) → stock geri yüklemeye gerek yok
              await tx.product.update({
                where: { id: item.productId },
                data: { stock: { increment: item.quantity } },
              });
            }
          }
        }

        await tx.order.update({
          where: { id: payment.orderId },
          data: { status: 'PAYMENT_FAILED' },
        });
        this.logger.warn(
          `Payment failed: ${payment.id} - ${data.failed_reason_msg}`,
        );
      }
    });

    await this.logPayment(payment.id, `paytr.webhook.${data.status}`, data);

    // ─── Subscription payment detection ───
    const providerData = payment.providerData as any;
    if (providerData?.isSubscriptionPayment && providerData?.subscriptionId) {
      const subId = providerData.subscriptionId;
      if (newStatus === PaymentStatus.COMPLETED) {
        // Extract card token from PayTR response (utoken for recurring)
        const cardToken = (data as any).utoken || null;
        const cardLast4 = (data as any).card_last4 || null;
        const cardBrand = (data as any).card_brand || null;
        try {
          await this.onSubscriptionPaymentComplete?.(
            subId, cardToken, cardLast4, cardBrand, 'paytr',
          );
        } catch (e) {
          this.logger.error(`Subscription completion failed for ${subId}:`, e);
        }
      } else {
        try {
          await this.onSubscriptionPaymentFailed?.(
            subId, data.failed_reason_msg || 'Payment failed',
          );
        } catch (e) {
          this.logger.error(`Subscription failure handler failed for ${subId}:`, e);
        }
      }
    }

    return { status: 'OK' };
  }

  async handleIyzicoWebhook(data: {
    token: string;
    conversationId: string;
    status?: string;
    paymentId?: string;
  }) {
    const secretKey = this.config.get<string>('iyzico.secretKey');
    const apiKey = this.config.get<string>('iyzico.apiKey');
    const baseUrl =
      this.config.get<string>('iyzico.baseUrl') ||
      'https://sandbox-api.iyzipay.com';

    // Token ile ödeme sonucunu sorgula
    const requestBody = {
      locale: 'tr',
      conversationId: data.conversationId,
      token: data.token,
    };

    const randomString = this.generateRandomString(8);
    const authString = this.generateIyzicoAuth(
      apiKey!,
      secretKey!,
      randomString,
      requestBody,
    );

    try {
      const response = await fetch(
        `${baseUrl}/payment/iyzipos/checkoutform/auth/ecom/detail`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: authString,
            'x-iyzi-rnd': randomString,
          },
          body: JSON.stringify(requestBody),
        },
      );

      const rawBody = await response.text();
      let result: any;
      try {
        result = rawBody ? JSON.parse(rawBody) : null;
      } catch {
        this.logger.error(`PayTR non-JSON response (${response.status}): ${rawBody.slice(0, 300)}`);
        throw new Error(`PayTR returned non-JSON response with status ${response.status}`);
      }

      if (!response.ok || !result) {
        this.logger.error(`PayTR HTTP error (${response.status}): ${rawBody.slice(0, 300)}`);
        throw new Error(`PayTR HTTP ${response.status}`);
      }

      const payment = await this.prisma.payment.findUnique({
        where: { id: data.conversationId },
      });

      if (!payment) {
        this.logger.error(`Payment not found: ${data.conversationId}`);
        return { status: 'FAIL' };
      }

      const newStatus =
        result.paymentStatus === 'SUCCESS'
          ? PaymentStatus.COMPLETED
          : PaymentStatus.FAILED;

      // Use transaction for atomic updates
      await this.prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: newStatus,
            paidAt: newStatus === PaymentStatus.COMPLETED ? new Date() : null,
            providerPaymentId: result.paymentId,
            providerData: result,
          },
        });

        if (newStatus === PaymentStatus.COMPLETED) {
          await tx.order.update({
            where: { id: payment.orderId },
            data: { status: 'CONFIRMED', paidAt: new Date() },
          });
        } else {
          // Payment failed - restore stock
          const order = await tx.order.findUnique({
            where: { id: payment.orderId },
            include: { items: true },
          });
          if (order) {
            for (const item of order.items) {
              if (item.variantId) {
                await tx.productVariant.update({
                  where: { id: item.variantId },
                  data: { stock: { increment: item.quantity } },
                });
              } else if (item.productId) {
                // Ürün silinmiş olabilir → atla
                await tx.product.update({
                  where: { id: item.productId },
                  data: { stock: { increment: item.quantity } },
                });
              }
            }
          }
          await tx.order.update({
            where: { id: payment.orderId },
            data: { status: 'PAYMENT_FAILED' },
          });
        }
      });

      await this.logPayment(
        payment.id,
        `iyzico.webhook.${result.paymentStatus}`,
        result,
      );

      // ─── Subscription payment detection ───
      const providerData = payment.providerData as any;
      if (providerData?.isSubscriptionPayment && providerData?.subscriptionId) {
        const subId = providerData.subscriptionId;
        if (newStatus === PaymentStatus.COMPLETED) {
          const cardToken = result.cardToken || null;
          const cardLast4 = result.cardAssociation || null;
          const cardBrand = result.cardFamily || null;
          try {
            await this.onSubscriptionPaymentComplete?.(
              subId, cardToken, cardLast4, cardBrand, 'iyzico',
            );
          } catch (e) {
            this.logger.error(`Subscription completion failed for ${subId}:`, e);
          }
        } else {
          try {
            await this.onSubscriptionPaymentFailed?.(
              subId, result.errorMessage || 'Payment failed',
            );
          } catch (e) {
            this.logger.error(`Subscription failure handler failed for ${subId}:`, e);
          }
        }
      }

      return { status: 'OK' };
    } catch (error) {
      this.logger.error('iyzico webhook error:', error);
      await this.logPayment(data.conversationId, 'iyzico.webhook.error', {
        error: String(error),
      });
      return { status: 'FAIL' };
    }
  }

  // ══════════════════════════════════════════════
  // REFUND
  // ══════════════════════════════════════════════

  async refund(paymentId: string, amount: number, reason?: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        order: { include: { items: true } },
        refunds: { where: { status: 'COMPLETED' } },
      },
    });

    if (!payment) throw new BadRequestException('Ödeme bulunamadı');
    if (
      payment.status !== PaymentStatus.COMPLETED &&
      payment.status !== PaymentStatus.REFUNDED
    ) {
      throw new BadRequestException(
        'Sadece tamamlanmış ödemeler iade edilebilir',
      );
    }

    // Calculate total already refunded
    const totalRefunded = payment.refunds.reduce(
      (sum, r) => sum + Number(r.amount),
      0,
    );
    const maxRefundable = Number(payment.amount) - totalRefunded;

    if (amount > maxRefundable) {
      throw new BadRequestException(
        `İade tutarı maksimum ${maxRefundable.toFixed(2)} TL olabilir`,
      );
    }

    // İade kaydı oluştur ve stok geri al (transaction ile)
    const refund = await this.prisma.$transaction(async (tx) => {
      const newRefund = await tx.refund.create({
        data: {
          paymentId,
          amount,
          reason,
          status: 'PENDING',
        },
      });

      // Restore stock for refunded order (full refund case)
      if (amount === Number(payment.amount) && payment.order) {
        for (const item of payment.order.items) {
          if (item.variantId) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: { stock: { increment: item.quantity } },
            });
          } else if (item.productId) {
            // Ürün silinmiş olabilir → atla
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } },
            });
          }
        }
      }

      return newRefund;
    });

    // PayTR iade API çağrısı
    const merchantId = this.config.get<string>('paytr.merchantId');
    const merchantKey = this.config.get<string>('paytr.merchantKey');
    const merchantSalt = this.config.get<string>('paytr.merchantSalt');

    if (
      merchantId &&
      merchantKey &&
      merchantSalt &&
      payment.providerPaymentId
    ) {
      try {
        const refundAmount = Math.round(amount * 100); // Kuruş
        const hashStr =
          merchantId + payment.providerPaymentId + refundAmount + merchantSalt;
        const paytrToken = crypto
          .createHmac('sha256', merchantKey)
          .update(hashStr)
          .digest('base64');

        const response = await fetch('https://www.paytr.com/odeme/iade', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            merchant_id: merchantId,
            merchant_oid: payment.providerPaymentId,
            return_amount: String(refundAmount),
            paytr_token: paytrToken,
          }).toString(),
        });

        const rawBody = await response.text();
      let result: any;
      try {
        result = rawBody ? JSON.parse(rawBody) : null;
      } catch {
        this.logger.error(`PayTR non-JSON response (${response.status}): ${rawBody.slice(0, 300)}`);
        throw new Error(`PayTR returned non-JSON response with status ${response.status}`);
      }

      if (!response.ok || !result) {
        this.logger.error(`PayTR HTTP error (${response.status}): ${rawBody.slice(0, 300)}`);
        throw new Error(`PayTR HTTP ${response.status}`);
      }

        if (result.status === 'success') {
          await this.prisma.refund.update({
            where: { id: refund.id },
            data: { status: 'COMPLETED', processedAt: new Date() },
          });

          await this.prisma.payment.update({
            where: { id: paymentId },
            data: { status: PaymentStatus.REFUNDED },
          });

          this.logger.log(`Refund completed: ${refund.id}`);
        } else {
          await this.prisma.refund.update({
            where: { id: refund.id },
            data: { status: 'FAILED' },
          });
          this.logger.error(`Refund failed: ${result.err_msg}`);
        }

        await this.logPayment(paymentId, 'refund.result', result);
      } catch (error) {
        this.logger.error('Refund API error:', error);
        await this.prisma.refund.update({
          where: { id: refund.id },
          data: { status: 'FAILED' },
        });
      }
    } else {
      // Test mode - direkt başarılı say
      await this.prisma.refund.update({
        where: { id: refund.id },
        data: { status: 'COMPLETED', processedAt: new Date() },
      });
    }

    await this.logPayment(paymentId, 'refund.created', {
      amount,
      reason,
      refundId: refund.id,
    });
    return refund;
  }

  // ══════════════════════════════════════════════
  // HELPERS
  // ══════════════════════════════════════════════

  private async logPayment(paymentId: string, event: string, data: any) {
    try {
      await this.prisma.paymentLog.create({
        data: { paymentId, event, data },
      });
    } catch (error) {
      this.logger.error(`Failed to log payment event: ${event}`, error);
    }
  }

  async getPaymentStatus(paymentId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        order: { select: { orderNumber: true, status: true } },
        refunds: true,
        logs: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });

    if (!payment) throw new BadRequestException('Ödeme bulunamadı');
    return payment;
  }

  // ══════════════════════════════════════════════
  // ADMIN PAYMENT MANAGEMENT
  // ══════════════════════════════════════════════

  async adminGetPayments(query: {
    page?: number;
    limit?: number;
    status?: string;
    method?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: string;
  }) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const where: any = {};

    // Filter by status
    if (query.status) {
      where.status = query.status;
    }

    // Filter by method
    if (query.method) {
      where.method = query.method;
    }

    // Search by order number or user email
    if (query.search) {
      where.order = {
        OR: [
          { orderNumber: { contains: query.search, mode: 'insensitive' } },
          { user: { email: { contains: query.search, mode: 'insensitive' } } },
        ],
      };
    }

    // Date range filter
    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) {
        where.createdAt.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        where.createdAt.lte = new Date(query.endDate);
      }
    }

    // Sort
    const orderBy: any = {};
    const sortField = query.sortBy || 'createdAt';
    const sortDir = query.sortOrder === 'asc' ? 'asc' : 'desc';
    orderBy[sortField] = sortDir;

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          order: {
            select: {
              orderNumber: true,
              status: true,
              user: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          refunds: {
            select: {
              id: true,
              amount: true,
              status: true,
              createdAt: true,
            },
          },
        },
      }),
      this.prisma.payment.count({ where }),
    ]);

    return {
      data: payments,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async adminGetPaymentStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

    const [
      totalPayments,
      successfulPayments,
      failedPayments,
      pendingPayments,
      todayRevenue,
      thisMonthRevenue,
      lastMonthRevenue,
      totalRefunds,
      refundAmount,
    ] = await Promise.all([
      this.prisma.payment.count(),
      this.prisma.payment.count({ where: { status: PaymentStatus.COMPLETED } }),
      this.prisma.payment.count({ where: { status: PaymentStatus.FAILED } }),
      this.prisma.payment.count({ where: { status: PaymentStatus.PENDING } }),
      this.prisma.payment.aggregate({
        where: { status: PaymentStatus.COMPLETED, paidAt: { gte: today } },
        _sum: { amount: true },
      }),
      this.prisma.payment.aggregate({
        where: { status: PaymentStatus.COMPLETED, paidAt: { gte: thisMonth } },
        _sum: { amount: true },
      }),
      this.prisma.payment.aggregate({
        where: {
          status: PaymentStatus.COMPLETED,
          paidAt: { gte: lastMonth, lte: lastMonthEnd },
        },
        _sum: { amount: true },
      }),
      this.prisma.refund.count({ where: { status: 'COMPLETED' } }),
      this.prisma.refund.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true },
      }),
    ]);

    // Payment method distribution
    const methodDistribution = await this.prisma.payment.groupBy({
      by: ['method'],
      where: { status: PaymentStatus.COMPLETED },
      _count: true,
      _sum: { amount: true },
    });

    return {
      totalPayments,
      successfulPayments,
      failedPayments,
      pendingPayments,
      todayRevenue: todayRevenue._sum.amount || 0,
      thisMonthRevenue: thisMonthRevenue._sum.amount || 0,
      lastMonthRevenue: lastMonthRevenue._sum.amount || 0,
      totalRefunds,
      totalRefundAmount: refundAmount._sum.amount || 0,
      methodDistribution: methodDistribution.map((m) => ({
        method: m.method,
        count: m._count,
        amount: m._sum.amount || 0,
      })),
    };
  }
}
