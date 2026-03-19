import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { IdentityService } from './identity.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { EnableMfaDto } from './dto/mfa.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Auth')
@Controller('auth')
export class IdentityController {
  constructor(private readonly identityService: IdentityService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register with email + password' })
  register(@Body() dto: RegisterDto) {
    return this.identityService.register(dto);
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login with email + password (+ optional MFA)' })
  login(@Body() dto: LoginDto) {
    return this.identityService.login(dto);
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiBody({ schema: { properties: { refreshToken: { type: 'string' } } } })
  refresh(@Body('refreshToken') refreshToken: string) {
    return this.identityService.refreshToken(refreshToken);
  }

  @ApiBearerAuth('access-token')
  @Post('logout')
  @ApiOperation({ summary: 'Logout and revoke all refresh tokens' })
  logout(@CurrentUser('id') userId: string) {
    return this.identityService.logout(userId);
  }

  // ── Google OAuth ──
  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth login' })
  googleAuth() {}

  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth callback' })
  async googleCallback(@Req() req, @Res() res) {
    const result = await this.identityService.oauthLogin(req.user);
    // Redirect to frontend with tokens
    const params = new URLSearchParams({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
    res.redirect(
      `${process.env.CORS_ORIGINS?.split(',')[0] || 'http://localhost:3000'}/auth/callback?${params}`,
    );
  }

  // ── Apple OAuth ──
  @Public()
  @Get('apple')
  @UseGuards(AuthGuard('apple'))
  @ApiOperation({ summary: 'Apple OAuth login' })
  appleAuth() {}

  @Public()
  @Post('apple/callback')
  @UseGuards(AuthGuard('apple'))
  @ApiOperation({ summary: 'Apple OAuth callback' })
  async appleCallback(@Req() req, @Res() res) {
    const result = await this.identityService.oauthLogin(req.user);
    const params = new URLSearchParams({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
    res.redirect(
      `${process.env.CORS_ORIGINS?.split(',')[0] || 'http://localhost:3000'}/auth/callback?${params}`,
    );
  }

  // ── MFA ──
  @ApiBearerAuth('access-token')
  @Post('mfa/setup')
  @ApiOperation({ summary: 'Setup MFA — returns QR code' })
  setupMfa(@CurrentUser('id') userId: string) {
    return this.identityService.setupMfa(userId);
  }

  @ApiBearerAuth('access-token')
  @Post('mfa/enable')
  @ApiOperation({ summary: 'Enable MFA — verify TOTP code' })
  enableMfa(@CurrentUser('id') userId: string, @Body() dto: EnableMfaDto) {
    return this.identityService.enableMfa(userId, dto.code);
  }

  @ApiBearerAuth('access-token')
  @Post('mfa/disable')
  @ApiOperation({ summary: 'Disable MFA' })
  disableMfa(@CurrentUser('id') userId: string) {
    return this.identityService.disableMfa(userId);
  }

  // ── Profile ──
  @ApiBearerAuth('access-token')
  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@CurrentUser('id') userId: string) {
    return this.identityService.getProfile(userId);
  }
}
