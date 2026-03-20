import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../prisma/prisma.service';
import { RedisService } from '../../../common/services/redis.service';

@Injectable()
export class LoginThrottleGuard implements CanActivate {
  private readonly logger = new Logger(LoginThrottleGuard.name);

  // Konfigürasyon from env
  private readonly MAX_ATTEMPTS: number;
  private readonly LOCKOUT_MINUTES: number;
  private readonly ATTEMPT_WINDOW_MINUTES: number;

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private config: ConfigService,
  ) {
    this.MAX_ATTEMPTS = this.config.get<number>('identity.maxLoginAttempts', 5);
    this.LOCKOUT_MINUTES = this.config.get<number>(
      'identity.lockoutMinutes',
      30,
    );
    this.ATTEMPT_WINDOW_MINUTES = this.config.get<number>(
      'identity.attemptWindowMinutes',
      15,
    );
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { email } = request.body;
    const ipAddress = this.getClientIp(request);

    if (!email) return true;

    // 1. Account lockout kontrolü
    const lockout = await this.prisma.accountLockout.findUnique({
      where: { email },
    });

    if (lockout && lockout.lockedUntil > new Date()) {
      const remainingMinutes = Math.ceil(
        (lockout.lockedUntil.getTime() - Date.now()) / 1000 / 60,
      );

      this.logger.warn(`Account locked: ${email}, IP: ${ipAddress}`);

      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: `Hesabınız kilitli. ${remainingMinutes} dakika sonra tekrar deneyin.`,
          lockedUntil: lockout.lockedUntil,
          remainingMinutes,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // 2. Redis rate limiting (IP bazlı)
    const ipKey = `login_attempts:ip:${ipAddress}`;
    const ipAttempts = await this.redis.incr(ipKey);

    if (ipAttempts === 1) {
      await this.redis.expire(ipKey, this.ATTEMPT_WINDOW_MINUTES * 60);
    }

    if (ipAttempts > this.MAX_ATTEMPTS * 3) {
      // IP başına 3 kat limit
      this.logger.warn(`IP rate limited: ${ipAddress}`);
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Çok fazla deneme. Lütfen daha sonra tekrar deneyin.',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // 3. Email bazlı son denemeler
    const recentAttempts = await this.prisma.loginAttempt.count({
      where: {
        email,
        success: false,
        createdAt: {
          gte: new Date(Date.now() - this.ATTEMPT_WINDOW_MINUTES * 60 * 1000),
        },
      },
    });

    if (recentAttempts >= this.MAX_ATTEMPTS) {
      // Hesabı kilitle
      await this.lockAccount(email, ipAddress);

      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: `Çok fazla başarısız deneme. Hesabınız ${this.LOCKOUT_MINUTES} dakika kilitlendi.`,
          lockedUntil: new Date(Date.now() + this.LOCKOUT_MINUTES * 60 * 1000),
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Request'e deneme sayısını ekle (sonradan loglamak için)
    request.loginAttemptCount = recentAttempts + 1;
    request.clientIp = ipAddress;

    return true;
  }

  private async lockAccount(email: string, ipAddress: string): Promise<void> {
    const lockedUntil = new Date(Date.now() + this.LOCKOUT_MINUTES * 60 * 1000);

    await this.prisma.accountLockout.upsert({
      where: { email },
      update: {
        lockedUntil,
        lockCount: { increment: 1 },
        lastLockReason: 'Too many failed login attempts',
        lastLockIp: ipAddress,
      },
      create: {
        email,
        lockedUntil,
        lockCount: 1,
        lastLockReason: 'Too many failed login attempts',
        lastLockIp: ipAddress,
      },
    });

    this.logger.warn(`Account locked: ${email} until ${lockedUntil}`);
  }

  private getClientIp(request: any): string {
    return (
      request.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      request.headers['x-real-ip'] ||
      request.connection?.remoteAddress ||
      request.ip ||
      '127.0.0.1'
    );
  }
}

/**
 * Login denemesini logla (başarılı veya başarısız)
 */
export async function logLoginAttempt(
  prisma: PrismaService,
  email: string,
  success: boolean,
  ipAddress: string,
  userAgent?: string,
  userId?: string,
  failReason?: string,
): Promise<void> {
  await prisma.loginAttempt.create({
    data: {
      email,
      success,
      ipAddress,
      userAgent,
      userId,
      failReason,
    },
  });

  // Başarılı giriş sonrası lockout'u temizle
  if (success) {
    await prisma.accountLockout.deleteMany({
      where: { email },
    });
  }
}
