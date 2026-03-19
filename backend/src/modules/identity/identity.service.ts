import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { generateSecret, verifySync, generateURI } from 'otplib';
import * as QRCode from 'qrcode';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthProvider } from '@prisma/client';

@Injectable()
export class IdentityService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
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
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    // MFA check
    if (user.mfaEnabled && user.mfaSecret) {
      if (!dto.mfaCode) {
        return { requiresMfa: true, userId: user.id };
      }
      const result = verifySync({ token: dto.mfaCode, secret: user.mfaSecret });
      const isValid = result.valid;
      if (!isValid) throw new UnauthorizedException('Invalid MFA code');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    return { user: this.sanitizeUser(user), ...tokens };
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
    if (!user || !user.mfaSecret) throw new BadRequestException('Setup MFA first');

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
    const { passwordHash, mfaSecret, ...safe } = user;
    return safe;
  }
}
