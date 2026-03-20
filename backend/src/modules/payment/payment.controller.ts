import { Controller, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole, PaymentMethod } from '@prisma/client';
import { PayTRWebhookDto, IyzicoWebhookDto } from './dto/payment.dto';

@ApiTags('Payments')
@Controller()
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @ApiBearerAuth('access-token')
  @Post('checkout/session')
  @ApiOperation({ summary: 'Create checkout/payment session' })
  createSession(
    @CurrentUser('id') userId: string,
    @Body() body: { orderId: string; method: PaymentMethod },
  ) {
    return this.paymentService.createCheckoutSessionSecure(
      body.orderId,
      body.method,
      userId,
    );
  }

  @ApiBearerAuth('access-token')
  @Post('checkout/google-pay')
  @ApiOperation({ summary: 'Get Google Pay config for order' })
  googlePay(
    @CurrentUser('id') userId: string,
    @Body() body: { orderId: string },
  ) {
    return this.paymentService.initGooglePaySecure(body.orderId, userId);
  }

  @ApiBearerAuth('access-token')
  @Post('checkout/apple-pay')
  @ApiOperation({ summary: 'Get Apple Pay config for order' })
  applePay(
    @CurrentUser('id') userId: string,
    @Body() body: { orderId: string },
  ) {
    return this.paymentService.initApplePaySecure(body.orderId, userId);
  }

  // ── Webhooks (public — called by payment providers) ──

  @Public()
  @Post('webhooks/paytr')
  @ApiOperation({ summary: 'PayTR payment webhook' })
  paytrWebhook(@Body() dto: PayTRWebhookDto) {
    return this.paymentService.handlePayTRWebhook(dto);
  }

  @Public()
  @Post('webhooks/iyzico')
  @ApiOperation({ summary: 'iyzico payment webhook' })
  iyzicoWebhook(@Body() dto: IyzicoWebhookDto) {
    return this.paymentService.handleIyzicoWebhook(dto);
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
