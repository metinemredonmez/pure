import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  Res,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { IdentityService } from './identity.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { EnableMfaDto } from './dto/mfa.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ResendVerificationDto } from './dto/verify-email.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { LoginThrottleGuard } from './guards/throttle.guard';

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
  @UseGuards(LoginThrottleGuard)
  @Post('login')
  @ApiOperation({ summary: 'Login with email + password (+ optional MFA)' })
  login(@Body() dto: LoginDto, @Req() req) {
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const userAgent = req.headers['user-agent'];
    return this.identityService.login(dto, ipAddress, userAgent);
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
    const frontendUrl =
      process.env.CORS_ORIGINS?.split(',')[0] || 'http://localhost:3000';
    const isProduction = process.env.NODE_ENV === 'production';

    // Set tokens as httpOnly cookies instead of URL params (security)
    res.cookie('jwt', result.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.redirect(`${frontendUrl}/auth/callback?success=true`);
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
    const frontendUrl =
      process.env.CORS_ORIGINS?.split(',')[0] || 'http://localhost:3000';
    const isProduction = process.env.NODE_ENV === 'production';

    // Set tokens as httpOnly cookies instead of URL params (security)
    res.cookie('jwt', result.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.redirect(`${frontendUrl}/auth/callback?success=true`);
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

  // ══════════════════════════════════════════════
  // PASSWORD RESET (Şifre Sıfırlama)
  // ══════════════════════════════════════════════

  @Public()
  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset email' })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.identityService.forgotPassword(dto.email);
  }

  @Public()
  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password with token' })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.identityService.resetPassword(dto.token, dto.newPassword);
  }

  @ApiBearerAuth('access-token')
  @Post('change-password')
  @ApiOperation({ summary: 'Change password (authenticated user)' })
  @ApiBody({
    schema: {
      properties: {
        currentPassword: { type: 'string' },
        newPassword: { type: 'string' },
      },
    },
  })
  changePassword(
    @CurrentUser('id') userId: string,
    @Body('currentPassword') currentPassword: string,
    @Body('newPassword') newPassword: string,
  ) {
    return this.identityService.changePassword(
      userId,
      currentPassword,
      newPassword,
    );
  }

  // ══════════════════════════════════════════════
  // EMAIL VERIFICATION (Email Doğrulama)
  // ══════════════════════════════════════════════

  @Public()
  @Get('verify-email')
  @ApiOperation({ summary: 'Verify email with token' })
  @ApiQuery({ name: 'token', required: true })
  verifyEmail(@Query('token') token: string) {
    return this.identityService.verifyEmail(token);
  }

  @Public()
  @Post('resend-verification')
  @ApiOperation({ summary: 'Resend verification email' })
  resendVerification(@Body() dto: ResendVerificationDto) {
    return this.identityService.resendVerificationEmail(dto.email);
  }

  @ApiBearerAuth('access-token')
  @Post('send-verification')
  @ApiOperation({ summary: 'Send verification email (authenticated user)' })
  sendVerification(@CurrentUser('id') userId: string) {
    return this.identityService.sendVerificationEmail(userId);
  }
}
