import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisService } from './services/redis.service';
import { EncryptionService } from './services/encryption.service';
import { UploadService } from './services/upload.service';
import { PrismaModule } from '../prisma/prisma.module';

@Global()
@Module({
  imports: [ConfigModule, PrismaModule],
  providers: [RedisService, EncryptionService, UploadService],
  exports: [RedisService, EncryptionService, UploadService],
})
export class CommonModule {}
