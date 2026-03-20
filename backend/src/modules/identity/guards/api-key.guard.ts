import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
  SetMetadata,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../../prisma/prisma.service';
import { EncryptionService } from '../../../common/services/encryption.service';

export const REQUIRE_API_KEY = 'requireApiKey';
export const RequireApiKey = () => SetMetadata(REQUIRE_API_KEY, true);

@Injectable()
export class ApiKeyGuard implements CanActivate {
  private readonly logger = new Logger(ApiKeyGuard.name);

  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
    private encryption: EncryptionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // @RequireApiKey() decorator'ı var mı kontrol et
    const requireApiKey = this.reflector.getAllAndOverride<boolean>(
      REQUIRE_API_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requireApiKey) return true;

    const request = context.switchToHttp().getRequest();

    // API key'i header'dan al
    const apiKey =
      request.headers['x-api-key'] ||
      request.headers['authorization']?.replace('ApiKey ', '');

    if (!apiKey) {
      throw new UnauthorizedException('API anahtarı gerekli');
    }

    // API key'i veritabanında bul
    const keyRecord = await this.prisma.apiKey.findFirst({
      where: {
        isActive: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    });

    if (!keyRecord) {
      this.logger.warn('Invalid API key attempted');
      throw new UnauthorizedException('Geçersiz API anahtarı');
    }

    // Hash'i doğrula
    const isValid = await this.verifyApiKey(apiKey, keyRecord.keyHash);

    if (!isValid) {
      this.logger.warn('Invalid API key hash');
      throw new UnauthorizedException('Geçersiz API anahtarı');
    }

    // Son kullanım tarihini güncelle
    await this.prisma.apiKey.update({
      where: { id: keyRecord.id },
      data: { lastUsedAt: new Date() },
    });

    // Request'e API key bilgilerini ekle
    request.apiKey = {
      id: keyRecord.id,
      name: keyRecord.name,
      permissions: keyRecord.permissions,
    };

    return true;
  }

  private async verifyApiKey(
    apiKey: string,
    storedHash: string,
  ): Promise<boolean> {
    // API key formatı: prefix_randomstring
    const hash = this.encryption.hashApiKey(apiKey);
    return hash === storedHash;
  }
}

/**
 * Webhook HMAC doğrulama guard'ı
 */
@Injectable()
export class WebhookHmacGuard implements CanActivate {
  private readonly logger = new Logger(WebhookHmacGuard.name);
  private readonly webhookSecret: string | undefined;

  constructor(
    private encryption: EncryptionService,
    private config: ConfigService,
  ) {
    this.webhookSecret = this.config.get('app.webhookSecret');
    if (!this.webhookSecret && process.env.NODE_ENV === 'production') {
      throw new Error(
        'WEBHOOK_SECRET environment variable is required in production',
      );
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Signature header'ı al
    const signature =
      request.headers['x-webhook-signature'] ||
      request.headers['x-hub-signature-256'];

    if (!signature) {
      this.logger.warn('Webhook request without signature');
      throw new UnauthorizedException('Webhook imzası gerekli');
    }

    // Body'yi string olarak al
    const body = JSON.stringify(request.body);

    // Webhook secret from config
    const secret = this.webhookSecret || 'dev-webhook-secret-change-in-prod';

    // HMAC doğrula
    const isValid = this.encryption.verifyHmac(body, signature, secret);

    if (!isValid) {
      this.logger.warn('Invalid webhook signature');
      throw new UnauthorizedException('Geçersiz webhook imzası');
    }

    return true;
  }
}
