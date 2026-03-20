import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { PaymentMethod, PaymentStatus } from '@prisma/client';

@Injectable()
export class PaymentService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  // ── Create payment session ──
  async createCheckoutSession(orderId: string, method: PaymentMethod) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true, items: true },
    });

    if (!order) throw new BadRequestException('Order not found');

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

    // Log payment initiation
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

  // ── PayTR Integration ──
  private async initPayTR(payment: any, order: any) {
    // PayTR iframe token creation
    // https://dev.paytr.com/iframe-api
    const merchantId = this.config.get('paytr.merchantId');
    const merchantKey = this.config.get('paytr.merchantKey');
    const merchantSalt = this.config.get('paytr.merchantSalt');

    // Build PayTR basket
    const basket = order.items.map((item: any) => [
      item.productName,
      String(item.unitPrice),
      String(item.quantity),
    ]);

    // TODO: Generate HMAC token and POST to PayTR API
    // For now, return payment record with instructions
    return {
      paymentId: payment.id,
      provider: 'paytr',
      amount: Number(payment.amount),
      currency: payment.currency,
      // In production: return iframeToken from PayTR API
      iframeUrl: `https://www.paytr.com/odeme/guvenli/${payment.id}`,
      message: 'PayTR checkout session created',
    };
  }

  // ── iyzico Integration ──
  async initIyzico(payment: any, order: any) {
    const apiKey = this.config.get('iyzico.apiKey');
    const secretKey = this.config.get('iyzico.secretKey');
    const baseUrl = this.config.get('iyzico.baseUrl');

    // TODO: Implement iyzico checkout form
    // https://dev.iyzipay.com/tr/api/checkout-form
    return {
      paymentId: payment.id,
      provider: 'iyzico',
      amount: Number(payment.amount),
      currency: payment.currency,
      checkoutFormUrl: `${baseUrl}/payment/iyzipos/checkoutform`,
      message: 'iyzico checkout session created',
    };
  }

  // ── QR Code Payment ──
  private async initQRPayment(payment: any, order: any) {
    // Generate QR code for payment
    // Can be PayTR QR or bank QR (FAST/TR Karekod)
    return {
      paymentId: payment.id,
      provider: 'qr',
      amount: Number(payment.amount),
      currency: payment.currency,
      qrData: JSON.stringify({
        amount: Number(payment.amount),
        orderId: order.orderNumber,
        merchant: 'Olentia Pure',
      }),
      message: 'QR payment code generated',
    };
  }

  // ── Google Pay ──
  async initGooglePay(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) throw new BadRequestException('Order not found');

    // Google Pay works client-side, backend just needs to process the token
    return {
      merchantId: this.config.get('googlePay.merchantId'),
      merchantName: 'Olentia Pure',
      amount: Number(order.total),
      currency: 'TRY',
      countryCode: 'TR',
      gateway: 'paytr', // PayTR as gateway for Google Pay
    };
  }

  // ── Apple Pay ──
  async initApplePay(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) throw new BadRequestException('Order not found');

    return {
      merchantIdentifier: this.config.get('applePay.merchantId'),
      merchantName: 'Olentia Pure',
      amount: Number(order.total),
      currency: 'TRY',
      countryCode: 'TR',
      supportedNetworks: ['visa', 'masterCard'],
    };
  }

  // ── Webhook handler (PayTR callback) ──
  async handlePayTRWebhook(data: {
    merchant_oid: string;
    status: string;
    total_amount: string;
    hash: string;
  }) {
    // TODO: Verify HMAC hash
    const payment = await this.prisma.payment.findFirst({
      where: { id: data.merchant_oid },
    });

    if (!payment) return { status: 'FAIL' };

    const newStatus =
      data.status === 'success'
        ? PaymentStatus.COMPLETED
        : PaymentStatus.FAILED;

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: newStatus,
        paidAt: newStatus === PaymentStatus.COMPLETED ? new Date() : null,
        providerData: data as any,
      },
    });

    // Update order status
    if (newStatus === PaymentStatus.COMPLETED) {
      await this.prisma.order.update({
        where: { id: payment.orderId },
        data: { status: 'CONFIRMED' },
      });
    }

    await this.logPayment(payment.id, `webhook.${data.status}`, data);

    return { status: 'OK' };
  }

  // ── iyzico Webhook ──
  async handleIyzicoWebhook(data: any) {
    await this.logPayment(data.paymentId, 'iyzico.webhook', data);
    // TODO: Implement iyzico webhook verification
    return { status: 'OK' };
  }

  // ── Refund ──
  async refund(paymentId: string, amount: number, reason?: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });
    if (!payment) throw new BadRequestException('Payment not found');

    const refund = await this.prisma.refund.create({
      data: { paymentId, amount, reason },
    });

    // TODO: Call PayTR/iyzico refund API

    await this.logPayment(paymentId, 'refund.created', { amount, reason });

    return refund;
  }

  // ── Helper ──
  private async logPayment(paymentId: string, event: string, data: any) {
    await this.prisma.paymentLog.create({
      data: { paymentId, event, data },
    });
  }
}
