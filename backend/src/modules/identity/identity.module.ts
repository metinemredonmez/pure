import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { IdentityController } from './identity.controller';
import { IdentityService } from './identity.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { AppleStrategy } from './strategies/apple.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { LoginThrottleGuard } from './guards/throttle.guard';
import { JwtBlacklistGuard } from './guards/jwt-blacklist.guard';
import { ApiKeyGuard, WebhookHmacGuard } from './guards/api-key.guard';
import { NotificationModule } from '../notification/notification.module';
import { CommonModule } from '../../common/common.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('jwt.secret'),
        signOptions: { expiresIn: config.get('jwt.accessExpiry') },
      }),
    }),
    forwardRef(() => NotificationModule),
    CommonModule,
  ],
  controllers: [IdentityController],
  providers: [
    IdentityService,
    JwtStrategy,
    GoogleStrategy,
    AppleStrategy,
    JwtAuthGuard,
    RolesGuard,
    LoginThrottleGuard,
    JwtBlacklistGuard,
    ApiKeyGuard,
    WebhookHmacGuard,
  ],
  exports: [
    IdentityService,
    JwtAuthGuard,
    RolesGuard,
    LoginThrottleGuard,
    JwtBlacklistGuard,
    ApiKeyGuard,
    WebhookHmacGuard,
  ],
})
export class IdentityModule {}
