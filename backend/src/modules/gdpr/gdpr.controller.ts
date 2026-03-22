import { Controller, Get, Post, Delete, Body, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GdprService } from './gdpr.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { UpdateConsentDto, UpdateCookieConsentDto } from './dto/gdpr.dto';

@ApiTags('GDPR/KVKK')
@Controller('gdpr')
export class GdprController {
  constructor(private readonly gdprService: GdprService) {}

  // ══════════════════════════════════════════════
  // VERİ DIŞA AKTARMA
  // ══════════════════════════════════════════════

  @ApiBearerAuth('access-token')
  @Get('export')
  @ApiOperation({
    summary: 'Export all personal data (KVKK Madde 11 / GDPR Art. 20)',
  })
  exportData(@CurrentUser('id') userId: string) {
    return this.gdprService.exportUserData(userId);
  }

  // ══════════════════════════════════════════════
  // HESAP SİLME
  // ══════════════════════════════════════════════

  @ApiBearerAuth('access-token')
  @Delete('account')
  @ApiOperation({
    summary: 'Delete account (Right to be Forgotten - KVKK/GDPR Art. 17)',
  })
  deleteAccount(
    @CurrentUser('id') userId: string,
    @Body('confirmEmail') confirmEmail: string,
  ) {
    return this.gdprService.deleteAccount(userId, confirmEmail);
  }

  // ══════════════════════════════════════════════
  // CONSENT YÖNETİMİ
  // ══════════════════════════════════════════════

  @ApiBearerAuth('access-token')
  @Get('consents')
  @ApiOperation({ summary: 'Get consent history' })
  getConsents(@CurrentUser('id') userId: string) {
    return this.gdprService.getUserConsents(userId);
  }

  @ApiBearerAuth('access-token')
  @Post('consents')
  @ApiOperation({ summary: 'Update consent preference' })
  updateConsent(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateConsentDto,
    @Req() req,
  ) {
    const ipAddress = req.ip || (req.headers['x-forwarded-for'] as string);
    const userAgent = req.headers['user-agent'];
    return this.gdprService.updateConsent(
      userId,
      dto.consentType,
      dto.accepted,
      dto.version,
      ipAddress,
      userAgent,
    );
  }

  @ApiBearerAuth('access-token')
  @Post('privacy/accept')
  @ApiOperation({ summary: 'Accept privacy policy' })
  acceptPrivacy(
    @CurrentUser('id') userId: string,
    @Body('version') version: string,
    @Req() req,
  ) {
    const ipAddress = req.ip || (req.headers['x-forwarded-for'] as string);
    const userAgent = req.headers['user-agent'];
    return this.gdprService.acceptPrivacyPolicy(
      userId,
      version,
      ipAddress,
      userAgent,
    );
  }

  // ══════════════════════════════════════════════
  // ÇEREZ TERCİHLERİ (Public - giriş gerekmez)
  // ══════════════════════════════════════════════

  @Public()
  @Post('cookies')
  @ApiOperation({ summary: 'Update cookie consent preferences' })
  updateCookieConsent(
    @Body() dto: UpdateCookieConsentDto,
    @Req() req,
  ) {
    const ipAddress = req.ip || (req.headers['x-forwarded-for'] as string);
    const userAgent = req.headers['user-agent'];
    return this.gdprService.updateCookieConsent(
      null,
      dto.email || null,
      dto.preferences,
      ipAddress,
      userAgent,
    );
  }
}
