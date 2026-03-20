import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { generateSecret, verifySync, generateURI } from 'otplib';
import * as QRCode from 'qrcode';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthProvider } from '@prisma/client';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class IdentityService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private notificationService: NotificationService,
  ) {}

  // ── Register (email + password) ──
  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (exists) throw new ConflictException('Email already registered');

    if (!dto.privacyAccepted) {
      throw new BadRequestException('Privacy policy must be accepted');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        privacyAccepted: dto.privacyAccepted,
        marketingConsent: dto.marketingConsent || false,
        provider: AuthProvider.LOCAL,
      },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  // ── Login (email + password + optional MFA) ──
  async login(dto: LoginDto, ipAddress?: string, userAgent?: string) {
    // 1. Account lockout kontrolü
    const lockout = await this.prisma.accountLockout.findUnique({
      where: { email: dto.email },
    });

    if (lockout && lockout.lockedUntil > new Date()) {
      const remainingMinutes = Math.ceil(
        (lockout.lockedUntil.getTime() - Date.now()) / 60000,
      );
      throw new UnauthorizedException(
        `Hesabınız kilitli. ${remainingMinutes} dakika sonra tekrar deneyin.`,
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    // 2. Başarısız giriş kaydet (kullanıcı yoksa bile)
    const logAttempt = async (success: boolean) => {
      await this.prisma.loginAttempt.create({
        data: {
          email: dto.email,
          ipAddress: ipAddress || 'unknown',
          success,
          userAgent,
        },
      });
    };

    if (!user || !user.passwordHash) {
      await logAttempt(false);
      await this.handleFailedLogin(dto.email);
      throw new UnauthorizedException('Geçersiz email veya şifre');
    }

    if (!user.isActive) {
      await logAttempt(false);
      throw new UnauthorizedException('Hesap devre dışı bırakılmış');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      await logAttempt(false);
      await this.handleFailedLogin(dto.email);
      throw new UnauthorizedException('Geçersiz email veya şifre');
    }

    // MFA check
    if (user.mfaEnabled && user.mfaSecret) {
      if (!dto.mfaCode) {
        return { requiresMfa: true, userId: user.id };
      }
      const result = verifySync({ token: dto.mfaCode, secret: user.mfaSecret });
      const isValid = result.valid;
      if (!isValid) {
        await logAttempt(false);
        throw new UnauthorizedException('Geçersiz MFA kodu');
      }
    }

    // Başarılı giriş - lockout sıfırla
    await logAttempt(true);
    await this.clearLockout(dto.email);

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  // ── Brute-force Protection: Handle failed login ──
  private async handleFailedLogin(email: string) {
    const MAX_ATTEMPTS = this.configService.get<number>(
      'identity.maxLoginAttempts',
      5,
    );
    const LOCKOUT_DURATION_MINUTES = this.configService.get<number>(
      'identity.lockoutMinutes',
      30,
    );

    // Son 15 dakikadaki başarısız girişleri say
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const recentAttempts = await this.prisma.loginAttempt.count({
      where: {
        email,
        success: false,
        createdAt: { gte: fifteenMinutesAgo },
      },
    });

    if (recentAttempts >= MAX_ATTEMPTS) {
      const lockedUntil = new Date(
        Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000,
      );

      await this.prisma.accountLockout.upsert({
        where: { email },
        update: {
          lockedUntil,
          attempts: recentAttempts,
        },
        create: {
          email,
          lockedUntil,
          attempts: recentAttempts,
        },
      });
    }
  }

  // ── Clear lockout on successful login ──
  private async clearLockout(email: string) {
    await this.prisma.accountLockout.deleteMany({
      where: { email },
    });
  }

  // ── OAuth login/register (Google, Apple) ──
  async oauthLogin(profile: {
    providerId: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    provider: string;
  }) {
    let user = await this.prisma.user.findUnique({
      where: { email: profile.email },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: profile.email,
          firstName: profile.firstName,
          lastName: profile.lastName,
          avatar: profile.avatar,
          provider: profile.provider as AuthProvider,
          providerId: profile.providerId,
          emailVerified: true,
          privacyAccepted: true,
        },
      });
    } else if (!user.providerId) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          providerId: profile.providerId,
          provider: profile.provider as AuthProvider,
          avatar: profile.avatar || user.avatar,
          emailVerified: true,
        },
      });
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  // ── Refresh token ──
  async refreshToken(refreshToken: string) {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    const tokens = await this.generateTokens(
      stored.user.id,
      stored.user.email,
      stored.user.role,
    );
    return tokens;
  }

  // ── Logout ──
  async logout(userId: string) {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  // ── MFA Setup (generate QR) ──
  async setupMfa(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');

    const secret = generateSecret();
    const otpAuthUrl = generateURI({
      label: user.email,
      issuer: 'Olentia Pure',
      secret,
    });
    const qrCode = await QRCode.toDataURL(otpAuthUrl);

    await this.prisma.user.update({
      where: { id: userId },
      data: { mfaSecret: secret },
    });

    return { qrCode, secret };
  }

  // ── MFA Enable (verify code and activate) ──
  async enableMfa(userId: string, code: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.mfaSecret)
      throw new BadRequestException('Setup MFA first');

    const result = verifySync({ token: code, secret: user.mfaSecret });
    const isValid = result.valid;
    if (!isValid) throw new BadRequestException('Invalid code');

    await this.prisma.user.update({
      where: { id: userId },
      data: { mfaEnabled: true },
    });

    return { message: 'MFA enabled successfully' };
  }

  // ── MFA Disable ──
  async disableMfa(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { mfaEnabled: false, mfaSecret: null },
    });
    return { message: 'MFA disabled' };
  }

  // ── Get profile ──
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { addresses: true },
    });
    return this.sanitizeUser(user);
  }

  // ── Helper: generate access + refresh tokens ──
  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('jwt.accessExpiry'),
    });

    const refreshTokenValue = this.jwtService.sign(
      { sub: userId },
      { expiresIn: this.configService.get('jwt.refreshExpiry') },
    );

    await this.prisma.refreshToken.create({
      data: {
        token: refreshTokenValue,
        userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { accessToken, refreshToken: refreshTokenValue };
  }

  // ── Helper: remove sensitive fields ──
  private sanitizeUser(user: any) {
    if (!user) return null;
    const {
      passwordHash: _passwordHash,
      mfaSecret: _mfaSecret,
      ...safe
    } = user;
    return safe;
  }

  // ══════════════════════════════════════════════
  // PASSWORD RESET (Şifre Sıfırlama)
  // ══════════════════════════════════════════════

  // ── Request password reset ──
  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    // Güvenlik: Kullanıcı olsa da olmasa da aynı mesajı döndür
    if (!user) {
      return {
        message:
          'Eğer bu email kayıtlı ise, şifre sıfırlama bağlantısı gönderildi.',
      };
    }

    // Mevcut geçerli token varsa iptal et
    await this.prisma.passwordResetToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    });

    // Yeni token oluştur (cryptographically secure)
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 saat

    await this.prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    // Email gönder
    const resetLink = `${this.configService.get('app.frontendUrl') || 'http://localhost:3000'}/auth/reset-password?token=${token}`;
    await this.notificationService.sendPasswordReset(email, resetLink);

    return {
      message:
        'Eğer bu email kayıtlı ise, şifre sıfırlama bağlantısı gönderildi.',
    };
  }

  // ── Reset password with token ──
  async resetPassword(token: string, newPassword: string) {
    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      throw new BadRequestException('Geçersiz veya süresi dolmuş token');
    }

    if (resetToken.usedAt) {
      throw new BadRequestException('Bu token zaten kullanılmış');
    }

    if (resetToken.expiresAt < new Date()) {
      throw new BadRequestException('Token süresi dolmuş');
    }

    // Password policy check
    this.validatePasswordStrength(newPassword);

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // Update user password and mark token as used
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
      // Tüm refresh tokenları iptal et (güvenlik)
      this.prisma.refreshToken.updateMany({
        where: { userId: resetToken.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);

    return {
      message:
        'Şifreniz başarıyla güncellendi. Yeni şifrenizle giriş yapabilirsiniz.',
    };
  }

  // ══════════════════════════════════════════════
  // EMAIL VERIFICATION (Email Doğrulama)
  // ══════════════════════════════════════════════

  // ── Send verification email ──
  async sendVerificationEmail(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Kullanıcı bulunamadı');

    if (user.emailVerified) {
      return { message: 'Email zaten doğrulanmış' };
    }

    // Mevcut geçerli token varsa iptal et
    await this.prisma.emailVerificationToken.updateMany({
      where: { email: user.email, usedAt: null },
      data: { usedAt: new Date() },
    });

    // Yeni token oluştur
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 saat

    await this.prisma.emailVerificationToken.create({
      data: {
        token,
        email: user.email,
        expiresAt,
      },
    });

    // Email gönder
    const verifyLink = `${this.configService.get('app.frontendUrl') || 'http://localhost:3000'}/auth/verify-email?token=${token}`;
    await this.notificationService.sendTemplatedEmail(
      user.email,
      'email_verification',
      {
        firstName: user.firstName,
        verifyLink,
      },
    );

    return { message: 'Doğrulama emaili gönderildi' };
  }

  // ── Verify email with token ──
  async verifyEmail(token: string) {
    const verificationToken =
      await this.prisma.emailVerificationToken.findUnique({
        where: { token },
      });

    if (!verificationToken) {
      throw new BadRequestException('Geçersiz doğrulama bağlantısı');
    }

    if (verificationToken.usedAt) {
      throw new BadRequestException('Bu bağlantı zaten kullanılmış');
    }

    if (verificationToken.expiresAt < new Date()) {
      throw new BadRequestException('Doğrulama bağlantısı süresi dolmuş');
    }

    // Email'i doğrulanmış olarak işaretle
    await this.prisma.$transaction([
      this.prisma.user.updateMany({
        where: { email: verificationToken.email },
        data: { emailVerified: true },
      }),
      this.prisma.emailVerificationToken.update({
        where: { id: verificationToken.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return { message: 'Email adresiniz başarıyla doğrulandı' };
  }

  // ── Resend verification email ──
  async resendVerificationEmail(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Güvenlik: Kullanıcı olmasa bile aynı mesajı döndür
      return {
        message:
          'Eğer bu email kayıtlı ve doğrulanmamış ise, doğrulama bağlantısı gönderildi.',
      };
    }

    if (user.emailVerified) {
      return { message: 'Email zaten doğrulanmış' };
    }

    return this.sendVerificationEmail(user.id);
  }

  // ══════════════════════════════════════════════
  // PASSWORD POLICY (Şifre Politikası)
  // ══════════════════════════════════════════════

  private validatePasswordStrength(password: string): void {
    const minLength = 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[@$!%*?&]/.test(password);

    if (password.length < minLength) {
      throw new BadRequestException(`Şifre en az ${minLength} karakter olmalı`);
    }
    if (!hasUppercase) {
      throw new BadRequestException('Şifre en az bir büyük harf içermeli');
    }
    if (!hasLowercase) {
      throw new BadRequestException('Şifre en az bir küçük harf içermeli');
    }
    if (!hasNumber) {
      throw new BadRequestException('Şifre en az bir rakam içermeli');
    }
    if (!hasSpecial) {
      throw new BadRequestException(
        'Şifre en az bir özel karakter içermeli (@$!%*?&)',
      );
    }
  }

  // ── Change password (authenticated user) ──
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.passwordHash) {
      throw new BadRequestException('Şifre değiştirme işlemi yapılamıyor');
    }

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Mevcut şifre yanlış');
    }

    // Yeni şifrenin eskiyle aynı olmadığını kontrol et
    const isSame = await bcrypt.compare(newPassword, user.passwordHash);
    if (isSame) {
      throw new BadRequestException('Yeni şifre eskisiyle aynı olamaz');
    }

    this.validatePasswordStrength(newPassword);

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    return { message: 'Şifreniz başarıyla güncellendi' };
  }
}
