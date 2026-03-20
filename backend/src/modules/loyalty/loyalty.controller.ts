import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LoyaltyService } from './loyalty.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

// ============================================
// KULLANICI LOYALTY ENDPOINTLERİ
// ============================================

@ApiTags('Loyalty — Sadakat Sistemi')
@ApiBearerAuth()
@Controller('loyalty')
export class LoyaltyController {
  constructor(private readonly loyaltyService: LoyaltyService) {}

  @Get('account')
  @ApiOperation({
    summary: 'Loyalty hesabımı getir',
    description: 'Puan, tier, sonraki ücretsiz kahveye kalan sipariş sayısı',
  })
  getMyAccount(@CurrentUser() user: any) {
    return this.loyaltyService.getAccount(user.sub);
  }

  @Post('activate')
  @ApiOperation({
    summary: 'Loyalty programına katıl',
    description: 'Referral kodu varsa 50 bonus puan kazanır',
  })
  activateAccount(
    @CurrentUser() user: any,
    @Body() body: { referralCode?: string },
  ) {
    return this.loyaltyService.createAccount(user.sub, body.referralCode);
  }

  @Get('history')
  @ApiOperation({ summary: 'Puan geçmişi' })
  getHistory(
    @CurrentUser() user: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.loyaltyService.getTransactionHistory(user.sub, page, limit);
  }

  @Get('rewards')
  @ApiOperation({ summary: 'Ödüllerimi listele' })
  getRewards(@CurrentUser() user: any, @Query('available') available?: string) {
    return this.loyaltyService.getRewards(user.sub, available === 'true');
  }

  @Post('redeem')
  @ApiOperation({
    summary: 'Puan ile indirim kuponu oluştur',
    description: 'Min 100 puan. 10 puan = 1 TL',
  })
  redeemDiscount(@CurrentUser() user: any, @Body() body: { points: number }) {
    return this.loyaltyService.redeemForDiscount(user.sub, body.points);
  }

  @Post('rewards/:id/claim')
  @ApiOperation({ summary: 'Ücretsiz kahve ödülünü kullan' })
  claimFreeReward(@CurrentUser() user: any, @Param('id') rewardId: string) {
    return this.loyaltyService.claimFreeReward(user.sub, rewardId);
  }

  @Get('repurchase')
  @ApiOperation({
    summary: 'Tekrar satın alma analizim',
    description: 'En çok aldığım ürünler, sipariş sıklığı, CLV',
  })
  getRepurchase(@CurrentUser() user: any) {
    return this.loyaltyService.getRepurchaseAnalysis(user.sub);
  }
}

// ============================================
// ADMIN LOYALTY YÖNETİMİ
// ============================================

@ApiTags('Loyalty — Admin')
@ApiBearerAuth()
@Controller('admin/loyalty')
export class AdminLoyaltyController {
  constructor(private readonly loyaltyService: LoyaltyService) {}

  @Roles(UserRole.ADMIN)
  @Get('stats')
  @ApiOperation({
    summary: 'Loyalty istatistikleri (tier dağılımı, toplam puan vs.)',
  })
  getStats() {
    return this.loyaltyService.getStats();
  }

  @Roles(UserRole.ADMIN)
  @Get('leaderboard')
  @ApiOperation({ summary: 'En sadık müşteriler sıralaması' })
  getLeaderboard(
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.loyaltyService.getLeaderboard(limit);
  }

  @Roles(UserRole.ADMIN)
  @Post('adjust')
  @ApiOperation({ summary: 'Kullanıcıya manuel puan ekle/çıkar' })
  adjustPoints(
    @Body() body: { userId: string; points: number; reason: string },
  ) {
    return this.loyaltyService.adminAdjustPoints(
      body.userId,
      body.points,
      body.reason,
    );
  }

  @Roles(UserRole.ADMIN)
  @Get('config')
  @ApiOperation({ summary: 'Loyalty konfigürasyonu getir' })
  getConfig() {
    return this.loyaltyService.getConfig();
  }

  @Roles(UserRole.ADMIN)
  @Post('config')
  @ApiOperation({ summary: 'Loyalty konfigürasyonu güncelle' })
  updateConfig(
    @Body() body: { key: string; value: string; description?: string },
  ) {
    return this.loyaltyService.updateConfig(
      body.key,
      body.value,
      body.description,
    );
  }

  @Roles(UserRole.ADMIN)
  @Get('users/:userId')
  @ApiOperation({ summary: 'Kullanıcının loyalty detayı' })
  getUserAccount(@Param('userId') userId: string) {
    return this.loyaltyService.getAccount(userId);
  }

  @Roles(UserRole.ADMIN)
  @Get('users/:userId/repurchase')
  @ApiOperation({ summary: 'Kullanıcının tekrar satın alma analizi' })
  getUserRepurchase(@Param('userId') userId: string) {
    return this.loyaltyService.getRepurchaseAnalysis(userId);
  }
}
