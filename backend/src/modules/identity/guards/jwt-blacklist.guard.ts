import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RedisService } from '../../../common/services/redis.service';
import { IS_PUBLIC_KEY } from '../../../common/decorators/public.decorator';

@Injectable()
export class JwtBlacklistGuard implements CanActivate {
  private readonly logger = new Logger(JwtBlacklistGuard.name);

  constructor(
    private reflector: Reflector,
    private redis: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Public endpoint'leri atla
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) return true; // JWT guard bunu handle edecek

    const token = authHeader.replace('Bearer ', '');

    // Token blacklist'te mi kontrol et
    const isBlacklisted = await this.redis.isTokenBlacklisted(token);

    if (isBlacklisted) {
      this.logger.warn('Blacklisted token used');
      throw new UnauthorizedException('Token geçersiz. Lütfen tekrar giriş yapın.');
    }

    // Kullanıcı ID'si ile de kontrol et (tüm token'ları invalidate etmek için)
    if (request.user?.id) {
      const userInvalidatedAt = await this.redis.getRaw(`user_tokens_invalid:${request.user.id}`);

      if (userInvalidatedAt) {
        // Token oluşturulma zamanını kontrol et (JWT payload'dan)
        const tokenIat = request.user.iat;
        if (tokenIat && tokenIat * 1000 < parseInt(userInvalidatedAt, 10)) {
          this.logger.warn(`All tokens invalidated for user: ${request.user.id}`);
          throw new UnauthorizedException('Oturumunuz sonlandırıldı. Lütfen tekrar giriş yapın.');
        }
      }
    }

    return true;
  }
}

/**
 * Token'ı blacklist'e ekle
 */
export async function blacklistToken(
  redis: RedisService,
  token: string,
  expiresInSeconds: number,
): Promise<void> {
  await redis.blacklistToken(token, expiresInSeconds);
}

/**
 * Kullanıcının tüm token'larını geçersiz kıl
 */
export async function invalidateAllUserTokens(
  redis: RedisService,
  userId: string,
): Promise<void> {
  await redis.set(`user_tokens_invalid:${userId}`, Date.now().toString(), 7 * 24 * 60 * 60); // 7 gün
}
