import { Controller, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole, PaymentMethod } from '@prisma/client';

@ApiTags('Payments')
@Controller()
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @ApiBearerAuth('access-token')
  @Post('checkout/session')
  @ApiOperation({ summary: 'Create checkout/payment session' })
  createSession(@Body() body: { orderId: string; method: PaymentMethod }) {
    return this.paymentService.createCheckoutSession(body.orderId, body.method);
  }

  @ApiBearerAuth('access-token')
  @Post('checkout/google-pay')
  @ApiOperation({ summary: 'Get Google Pay config for order' })
  googlePay(@Body() body: { orderId: string }) {
    return this.paymentService.initGooglePay(body.orderId);
  }

  @ApiBearerAuth('access-token')
  @Post('checkout/apple-pay')
  @ApiOperation({ summary: 'Get Apple Pay config for order' })
  applePay(@Body() body: { orderId: string }) {
    return this.paymentService.initApplePay(body.orderId);
  }

  // ── Webhooks (public — called by payment providers) ──

  @Public()
  @Post('webhooks/paytr')
  @ApiOperation({ summary: 'PayTR payment webhook' })
  paytrWebhook(@Body() data: any) {
    return this.paymentService.handlePayTRWebhook(data);
  }

  @Public()
  @Post('webhooks/iyzico')
  @ApiOperation({ summary: 'iyzico payment webhook' })
  iyzicoWebhook(@Body() data: any) {
    return this.paymentService.handleIyzicoWebhook(data);
  }

  // ── Admin ──

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @Post('admin/payments/:id/refund')
  @ApiOperation({ summary: 'Refund payment (admin)' })
  refund(
    @Param('id') id: string,
    @Body() body: { amount: number; reason?: string },
  ) {
    return this.paymentService.refund(id, body.amount, body.reason);
  }
}
