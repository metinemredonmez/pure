import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SubscriptionService } from './subscription.service';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole, GrindType } from '@prisma/client';

@ApiTags('Subscriptions')
@Controller()
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Public()
  @Get('subscription/plans')
  @ApiOperation({ summary: 'List subscription plans' })
  getPlans() {
    return this.subscriptionService.getPlans();
  }

  @ApiBearerAuth('access-token')
  @Post('subscriptions')
  @ApiOperation({ summary: 'Start subscription' })
  subscribe(
    @CurrentUser('id') userId: string,
    @Body() body: { planId: string; grindPreference?: GrindType },
  ) {
    return this.subscriptionService.subscribe(userId, body.planId, body.grindPreference);
  }

  @ApiBearerAuth('access-token')
  @Get('subscriptions')
  @ApiOperation({ summary: 'Get my subscriptions' })
  getMySubscriptions(@CurrentUser('id') userId: string) {
    return this.subscriptionService.getUserSubscriptions(userId);
  }

  @ApiBearerAuth('access-token')
  @Post('subscriptions/:id/pause')
  @ApiOperation({ summary: 'Pause subscription' })
  pause(@Param('id') id: string) {
    return this.subscriptionService.pause(id);
  }

  @ApiBearerAuth('access-token')
  @Post('subscriptions/:id/resume')
  @ApiOperation({ summary: 'Resume subscription' })
  resume(@Param('id') id: string) {
    return this.subscriptionService.resume(id);
  }

  @ApiBearerAuth('access-token')
  @Post('subscriptions/:id/cancel')
  @ApiOperation({ summary: 'Cancel subscription' })
  cancel(@Param('id') id: string) {
    return this.subscriptionService.cancel(id);
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @Get('admin/subscriptions')
  @ApiOperation({ summary: 'List all subscriptions (admin)' })
  findAll() {
    return this.subscriptionService.findAll();
  }
}
