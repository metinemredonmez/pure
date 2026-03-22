import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import {
  PayTRWebhookDto,
  IyzicoWebhookDto,
  InitPaymentDto,
  InitApplePayDto,
  InitGooglePayDto,
  RefundPaymentDto,
} from './dto/payment.dto';

@ApiTags('Payments')
@Controller()
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @ApiBearerAuth('access-token')
  @Post('checkout/session')
  @ApiOperation({ summary: 'Create checkout/payment session' })
  createSession(
    @CurrentUser('id') userId: string,
    @Body() dto: InitPaymentDto,
  ) {
    return this.paymentService.createCheckoutSessionSecure(
      dto.orderId,
      dto.method,
      userId,
    );
  }

  @ApiBearerAuth('access-token')
  @Post('checkout/google-pay')
  @ApiOperation({ summary: 'Get Google Pay config for order' })
  googlePay(@CurrentUser('id') userId: string, @Body() dto: InitGooglePayDto) {
    return this.paymentService.initGooglePaySecure(dto.orderId, userId);
  }

  @ApiBearerAuth('access-token')
  @Post('checkout/apple-pay')
  @ApiOperation({ summary: 'Get Apple Pay config for order' })
  applePay(@CurrentUser('id') userId: string, @Body() dto: InitApplePayDto) {
    return this.paymentService.initApplePaySecure(dto.orderId, userId);
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
  @Get('admin/payments')
  @ApiOperation({ summary: 'List all payments (admin)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'method', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, type: String })
  getPayments(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('method') method?: string,
    @Query('search') search?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
  ) {
    return this.paymentService.adminGetPayments({
      page,
      limit,
      status,
      method,
      search,
      startDate,
      endDate,
      sortBy,
      sortOrder,
    });
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @Get('admin/payments/stats')
  @ApiOperation({ summary: 'Payment statistics (admin)' })
  getPaymentStats() {
    return this.paymentService.adminGetPaymentStats();
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @Get('admin/payments/:id')
  @ApiOperation({ summary: 'Get payment detail (admin)' })
  getPaymentDetail(@Param('id') id: string) {
    return this.paymentService.getPaymentStatus(id);
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @Post('admin/payments/:id/refund')
  @ApiOperation({ summary: 'Refund payment (admin)' })
  refund(@Param('id') id: string, @Body() dto: RefundPaymentDto) {
    return this.paymentService.refund(id, dto.amount, dto.reason);
  }
}
