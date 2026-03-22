import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { SubscriptionService } from './subscription.service';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import {
  SubscribeDto,
  ChangePlanDto,
  UpdatePaymentMethodDto,
  UpdateGrindDto,
} from './dto/subscription.dto';

@ApiTags('Subscriptions')
@Controller()
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  // ══════════════════════════════════════════════
  // PUBLIC — Plan Listesi
  // ══════════════════════════════════════════════

  @Public()
  @Get('subscription/plans')
  @ApiOperation({ summary: 'List subscription plans' })
  getPlans() {
    return this.subscriptionService.getPlans();
  }

  // ══════════════════════════════════════════════
  // USER — Abonelik İşlemleri
  // ══════════════════════════════════════════════

  @ApiBearerAuth('access-token')
  @Post('subscriptions')
  @ApiOperation({ summary: 'Start subscription (initiates payment)' })
  subscribe(
    @CurrentUser('id') userId: string,
    @Body() dto: SubscribeDto,
  ) {
    return this.subscriptionService.subscribe(
      userId,
      dto.planId,
      dto.grindPreference,
      dto.paymentMethod,
    );
  }

  @ApiBearerAuth('access-token')
  @Get('subscriptions')
  @ApiOperation({ summary: 'Get my subscriptions' })
  getMySubscriptions(@CurrentUser('id') userId: string) {
    return this.subscriptionService.getUserSubscriptions(userId);
  }

  @ApiBearerAuth('access-token')
  @Get('subscriptions/:id')
  @ApiOperation({ summary: 'Get subscription detail with cycles & stats' })
  getDetail(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.subscriptionService.getSubscriptionDetail(id, userId);
  }

  @ApiBearerAuth('access-token')
  @Post('subscriptions/:id/change-plan')
  @ApiOperation({ summary: 'Change subscription plan (immediate or end_of_period)' })
  changePlan(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: ChangePlanDto,
  ) {
    return this.subscriptionService.changePlan(
      id,
      userId,
      dto.newPlanId,
      dto.timing,
    );
  }

  @ApiBearerAuth('access-token')
  @Delete('subscriptions/:id/pending-plan')
  @ApiOperation({ summary: 'Cancel pending plan change' })
  cancelPlanChange(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.subscriptionService.cancelPlanChange(id, userId);
  }

  @ApiBearerAuth('access-token')
  @Post('subscriptions/:id/payment-method')
  @ApiOperation({ summary: 'Update payment method (card)' })
  updatePaymentMethod(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdatePaymentMethodDto,
  ) {
    return this.subscriptionService.updatePaymentMethod(
      id,
      userId,
      dto.paymentToken,
      dto.cardLast4,
      dto.cardBrand,
      dto.provider,
    );
  }

  @ApiBearerAuth('access-token')
  @Post('subscriptions/:id/grind')
  @ApiOperation({ summary: 'Update grind preference' })
  updateGrind(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateGrindDto,
  ) {
    return this.subscriptionService.updateGrindPreference(
      id,
      userId,
      dto.grindPreference,
    );
  }

  @ApiBearerAuth('access-token')
  @Post('subscriptions/:id/pause')
  @ApiOperation({ summary: 'Pause subscription' })
  pause(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.subscriptionService.pauseForUser(id, userId);
  }

  @ApiBearerAuth('access-token')
  @Post('subscriptions/:id/resume')
  @ApiOperation({ summary: 'Resume subscription' })
  resume(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.subscriptionService.resumeForUser(id, userId);
  }

  @ApiBearerAuth('access-token')
  @Post('subscriptions/:id/cancel')
  @ApiOperation({ summary: 'Cancel subscription' })
  cancel(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.subscriptionService.cancelForUser(id, userId);
  }

  // ══════════════════════════════════════════════
  // ADMIN — Yönetim
  // ══════════════════════════════════════════════

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @Get('admin/subscriptions')
  @ApiOperation({ summary: 'List all subscriptions (admin)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', required: false })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('status') status?: string,
  ) {
    return this.subscriptionService.findAll(page, limit, status);
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @Get('admin/subscriptions/stats')
  @ApiOperation({ summary: 'Subscription stats — MRR, ARR, by-status (admin)' })
  getStats() {
    return this.subscriptionService.getSubscriptionStats();
  }

  // ══════════════════════════════════════════════
  // ADMIN — Plan CRUD
  // ══════════════════════════════════════════════

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @Post('admin/subscriptions/plans')
  @ApiOperation({ summary: 'Create subscription plan (admin)' })
  createPlan(@Body() body: any) {
    return this.subscriptionService.createPlan(body);
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @Put('admin/subscriptions/plans/:id')
  @ApiOperation({ summary: 'Update subscription plan (admin)' })
  updatePlan(@Param('id') id: string, @Body() body: any) {
    return this.subscriptionService.updatePlan(id, body);
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @Delete('admin/subscriptions/plans/:id')
  @ApiOperation({ summary: 'Delete subscription plan (admin)' })
  deletePlan(@Param('id') id: string) {
    return this.subscriptionService.deletePlan(id);
  }
}
