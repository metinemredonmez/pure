import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { KargonomiService } from './kargonomi.service';
import {
  AdminKargonomiController,
  KargonomiWebhookController,
} from './kargonomi.controller';

@Module({
  imports: [ConfigModule],
  controllers: [AdminKargonomiController, KargonomiWebhookController],
  providers: [KargonomiService],
  exports: [KargonomiService],
})
export class KargonomiModule {}
