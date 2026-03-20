import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

import configuration from './config/configuration';
import { PrismaModule } from './prisma/prisma.module';
import { AppController } from './app.controller';

// Common module (Redis, Encryption, Upload)
import { CommonModule } from './common/common.module';

// Domain modules
import { IdentityModule } from './modules/identity/identity.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { CartModule } from './modules/cart/cart.module';
import { OrderModule } from './modules/order/order.module';
import { PaymentModule } from './modules/payment/payment.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { B2bModule } from './modules/b2b/b2b.module';
import { CmsModule } from './modules/cms/cms.module';
import { ChatbotModule } from './modules/chatbot/chatbot.module';
import { NotificationModule } from './modules/notification/notification.module';
import { AiServiceModule } from './modules/ai-service/ai-service.module';
import { PartnerModule } from './modules/partner/partner.module';
import { LoyaltyModule } from './modules/loyalty/loyalty.module';

// Sprint 1 modules
import { UserModule } from './modules/user/user.module';
import { ReviewModule } from './modules/review/review.module';
import { AdminModule } from './modules/admin/admin.module';
import { GdprModule } from './modules/gdpr/gdpr.module';
import { PricingModule } from './modules/pricing/pricing.module';
import { OpsModule } from './modules/ops/ops.module';
import { ShippingModule } from './modules/shipping/shipping.module';

// Guards, filters, interceptors
import { JwtAuthGuard } from './modules/identity/guards/jwt-auth.guard';
import { JwtBlacklistGuard } from './modules/identity/guards/jwt-blacklist.guard';
import { RolesGuard } from './modules/identity/guards/roles.guard';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

@Module({
  imports: [
    // Config
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.THROTTLE_TTL || '60') * 1000,
        limit: parseInt(process.env.THROTTLE_LIMIT || '100'),
      },
    ]),

    // Database
    PrismaModule,

    // Common services (Redis, Encryption, Upload)
    CommonModule,

    // Domain modules
    IdentityModule,
    CatalogModule,
    CartModule,
    OrderModule,
    PaymentModule,
    SubscriptionModule,
    B2bModule,
    CmsModule,
    ChatbotModule,
    NotificationModule,
    AiServiceModule,
    PartnerModule,
    LoyaltyModule,

    // Sprint 1 modules
    UserModule,
    ReviewModule,
    AdminModule,
    GdprModule,
    PricingModule,
    OpsModule,
    ShippingModule,
  ],
  controllers: [AppController],
  providers: [
    // Global JWT auth guard (all routes protected by default)
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    // Global JWT blacklist guard (checks if token is revoked)
    { provide: APP_GUARD, useClass: JwtBlacklistGuard },
    // Global roles guard
    { provide: APP_GUARD, useClass: RolesGuard },
    // Global rate limiting
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    // Global exception filter
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    // Global response transform
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
  ],
})
export class AppModule {}
