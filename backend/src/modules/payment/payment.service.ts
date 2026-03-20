import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { PaymentMethod, PaymentStatus } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  // ══════════════════════════════════════════════
  // CHECKOUT SESSION
  // ══════════════════════════════════════════════

  async createCheckoutSession(orderId: string, method: PaymentMethod) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true, items: true },
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
        return this.initPayTR(payment, order);
      case PaymentMethod.QR_CODE:
        return this.initQRPayment(payment, order);
      default:
        return this.initPayTR(payment, order);
    }
  }

  // ══════════════════════════════════════════════
  // PAYTR INTEGRATION
  // https://dev.paytr.com/iframe-api
  // ══════════════════════════════════════════════

  private async initPayTR(payment: any, order: any) {
    const merchantId = this.config.get<string>('paytr.merchantId');
    const merchantKey = this.config.get<string>('paytr.merchantKey');
    const merchantSalt = this.config.get<string>('paytr.merchantSalt');

    if (!merchantId || !merchantKey || !merchantSalt) {
      this.logger.warn('PayTR credentials not configured');
      return {
        paymentId: payment.id,
        provider: 'paytr',
        error: 'Payment provider not configured',
        testMode: true,
      };
    }

    // Kullanıcı bilgileri
    const userEmail = order.user?.email || 'guest@olentia.com';
    const userName = `${order.user?.firstName || 'Guest'} ${order.user?.lastName || ''}`.trim();
    const userPhone = order.user?.phone || '05000000000';
    const userAddress = 'Türkiye';

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
      (Number(item.unitPrice) * 100).toFixed(0), // Kuruş
      String(item.quantity),
    ]);
    const userBasket = Buffer.from(JSON.stringify(basket)).toString('base64');

    // Callback URLs
    const merchantOkUrl = `${this.config.get('app.frontendUrl')}/odeme/basarili`;
    const merchantFailUrl = `${this.config.get('app.frontendUrl')}/odeme/basarisiz`;

    // IP adresi (gerçek uygulamada request'ten alınır)
    const userIp = '127.0.0.1';

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

    const paytrToken = this.generatePayTRToken(hashStr, merchantKey, merchantSalt);

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
      const response = await fetch('https://www.paytr.com/odeme/api/get-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(postData as any).toString(),
      });

      const result = await response.json();

      if (result.status === 'success') {
        await this.logPayment(payment.id, 'paytr.token.success', { token: result.token });
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
      this.logger.error('PayTR API error:', error);
      // Fallback for development/test
      return {
        paymentId: payment.id,
        provider: 'paytr',
        testMode: true,
        message: 'PayTR test mode - gerçek API çağrısı yapılmadı',
        amount: Number(payment.amount),
      };
    }
  }

  private generatePayTRToken(hashStr: string, merchantKey: string, merchantSalt: string): string {
    const hmac = crypto.createHmac('sha256', merchantKey + merchantSalt);
    hmac.update(hashStr);
    return Buffer.from(hmac.digest('hex')).toString('base64');
  }

  // ══════════════════════════════════════════════
  // IYZICO INTEGRATION
  // https://dev.iyzipay.com/tr/api/checkout-form
  // ══════════════════════════════════════════════

  async initIyzico(payment: any, order: any) {
    const apiKey = this.config.get<string>('iyzico.apiKey');
    const secretKey = this.config.get<string>('iyzico.secretKey');
    const baseUrl = this.config.get<string>('iyzico.baseUrl') || 'https://sandbox-api.iyzipay.com';

    if (!apiKey || !secretKey) {
      this.logger.warn('iyzico credentials not configured');
      return {
        paymentId: payment.id,
        provider: 'iyzico',
        error: 'Payment provider not configured',
        testMode: true,
      };
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
    const authString = this.generateIyzicoAuth(apiKey, secretKey, randomString, requestBody);

    try {
      const response = await fetch(`${baseUrl}/payment/iyzipos/checkoutform/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authString,
          'x-iyzi-rnd': randomString,
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (result.status === 'success') {
        await this.logPayment(payment.id, 'iyzico.init.success', { token: result.token });
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
        throw new BadRequestException(`Ödeme başlatılamadı: ${result.errorMessage}`);
      }
    } catch (error) {
      this.logger.error('iyzico API error:', error);
      return {
        paymentId: payment.id,
        provider: 'iyzico',
        testMode: true,
        message: 'iyzico test mode - gerçek API çağrısı yapılmadı',
        amount: Number(payment.amount),
      };
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
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
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
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new BadRequestException('Sipariş bulunamadı');

    return {
      merchantIdentifier: this.config.get('applePay.merchantId') || 'merchant.com.olentia',
      merchantName: 'Olentia Pure',
      amount: Number(order.total),
      currency: 'TRY',
      countryCode: 'TR',
      supportedNetworks: ['visa', 'masterCard', 'amex'],
      merchantCapabilities: ['supports3DS', 'supportsCredit', 'supportsDebit'],
    };
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

    if (merchantKey && merchantSalt) {
      const hashStr = data.merchant_oid + merchantSalt + data.status + data.total_amount;
      const expectedHash = crypto
        .createHmac('sha256', merchantKey)
        .update(hashStr)
        .digest('base64');

      if (data.hash !== expectedHash) {
        this.logger.error('PayTR webhook hash mismatch');
        await this.logPayment(data.merchant_oid, 'paytr.webhook.hash_mismatch', data);
        return { status: 'FAIL' };
      }
    }

    const payment = await this.prisma.payment.findUnique({
      where: { id: data.merchant_oid },
    });

    if (!payment) {
      this.logger.error(`Payment not found: ${data.merchant_oid}`);
      return { status: 'FAIL' };
    }

    const newStatus = data.status === 'success' ? PaymentStatus.COMPLETED : PaymentStatus.FAILED;

    await this.prisma.payment.update({
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
      await this.prisma.order.update({
        where: { id: payment.orderId },
        data: { status: 'CONFIRMED', paidAt: new Date() },
      });
      this.logger.log(`Payment completed: ${payment.id}`);
    } else {
      await this.prisma.order.update({
        where: { id: payment.orderId },
        data: { status: 'PAYMENT_FAILED' },
      });
      this.logger.warn(`Payment failed: ${payment.id} - ${data.failed_reason_msg}`);
    }

    await this.logPayment(payment.id, `paytr.webhook.${data.status}`, data);
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
    const baseUrl = this.config.get<string>('iyzico.baseUrl') || 'https://sandbox-api.iyzipay.com';

    // Token ile ödeme sonucunu sorgula
    const requestBody = {
      locale: 'tr',
      conversationId: data.conversationId,
      token: data.token,
    };

    const randomString = this.generateRandomString(8);
    const authString = this.generateIyzicoAuth(apiKey!, secretKey!, randomString, requestBody);

    try {
      const response = await fetch(`${baseUrl}/payment/iyzipos/checkoutform/auth/ecom/detail`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authString,
          'x-iyzi-rnd': randomString,
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      const payment = await this.prisma.payment.findUnique({
        where: { id: data.conversationId },
      });

      if (!payment) {
        this.logger.error(`Payment not found: ${data.conversationId}`);
        return { status: 'FAIL' };
      }

      const newStatus = result.paymentStatus === 'SUCCESS'
        ? PaymentStatus.COMPLETED
        : PaymentStatus.FAILED;

      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: newStatus,
          paidAt: newStatus === PaymentStatus.COMPLETED ? new Date() : null,
          providerPaymentId: result.paymentId,
          providerData: result as any,
        },
      });

      if (newStatus === PaymentStatus.COMPLETED) {
        await this.prisma.order.update({
          where: { id: payment.orderId },
          data: { status: 'CONFIRMED', paidAt: new Date() },
        });
      }

      await this.logPayment(payment.id, `iyzico.webhook.${result.paymentStatus}`, result);
      return { status: 'OK' };
    } catch (error) {
      this.logger.error('iyzico webhook error:', error);
      await this.logPayment(data.conversationId, 'iyzico.webhook.error', { error: String(error) });
      return { status: 'FAIL' };
    }
  }

  // ══════════════════════════════════════════════
  // REFUND
  // ══════════════════════════════════════════════

  async refund(paymentId: string, amount: number, reason?: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { order: true },
    });

    if (!payment) throw new BadRequestException('Ödeme bulunamadı');
    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException('Sadece tamamlanmış ödemeler iade edilebilir');
    }

    // İade kaydı oluştur
    const refund = await this.prisma.refund.create({
      data: {
        paymentId,
        amount,
        reason,
        status: 'PENDING',
      },
    });

    // PayTR iade API çağrısı
    const merchantId = this.config.get<string>('paytr.merchantId');
    const merchantKey = this.config.get<string>('paytr.merchantKey');
    const merchantSalt = this.config.get<string>('paytr.merchantSalt');

    if (merchantId && merchantKey && merchantSalt && payment.providerPaymentId) {
      try {
        const refundAmount = Math.round(amount * 100); // Kuruş
        const hashStr = merchantId + payment.providerPaymentId + refundAmount + merchantSalt;
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

        const result = await response.json();

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

    await this.logPayment(paymentId, 'refund.created', { amount, reason, refundId: refund.id });
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
}
