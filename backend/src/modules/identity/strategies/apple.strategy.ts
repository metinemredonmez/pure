import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-apple';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class AppleStrategy extends PassportStrategy(Strategy, 'apple') {
  private readonly logger = new Logger(AppleStrategy.name);

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      clientID: config.get<string>('apple.clientId') || 'com.olentia.pure',
      teamID: config.get<string>('apple.teamId') || 'TEAM_ID',
      keyID: config.get<string>('apple.keyId') || 'KEY_ID',
      privateKeyString: config.get<string>('apple.privateKey') || '',
      callbackURL:
        config.get<string>('apple.callbackUrl') ||
        'http://localhost:3000/api/auth/apple/callback',
      scope: ['name', 'email'],
      passReqToCallback: true,
    });
  }

  async validate(
    req: any,
    accessToken: string,
    refreshToken: string,
    idToken: any,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    try {
      // Apple ID token'dan bilgileri çıkar
      const appleId = idToken.sub;
      const email = idToken.email;

      // Apple ilk login'de name bilgisini body'de gönderir
      const firstName = req.body?.user?.name?.firstName || '';
      const lastName = req.body?.user?.name?.lastName || '';

      // Mevcut kullanıcıyı bul veya oluştur
      let user = await this.prisma.user.findFirst({
        where: {
          OR: [{ appleId }, { email: email || undefined }],
        },
      });

      if (user) {
        // Apple ID'yi güncelle (email ile bulunduysa)
        if (!user.appleId) {
          user = await this.prisma.user.update({
            where: { id: user.id },
            data: { appleId },
          });
        }
      } else {
        // Yeni kullanıcı oluştur
        user = await this.prisma.user.create({
          data: {
            email: email || `${appleId}@privaterelay.appleid.com`,
            appleId,
            firstName: firstName || 'Apple',
            lastName: lastName || 'User',
            emailVerified: true, // Apple email'i doğrulanmış kabul ediyoruz
            role: 'CUSTOMER',
          },
        });

        this.logger.log(`New Apple user created: ${user.id}`);
      }

      done(null, user);
    } catch (error) {
      this.logger.error('Apple OAuth validation error:', error);
      done(error as Error, undefined);
    }
  }
}
