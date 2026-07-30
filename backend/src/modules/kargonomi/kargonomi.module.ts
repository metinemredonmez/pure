import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { KargonomiService } from './kargonomi.service';
import { KargonomiOrderService } from './kargonomi-order.service';
import {
  AdminKargonomiController,
  KargonomiWebhookController,
} from './kargonomi.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { OrderModule } from '../order/order.module';
import { OpsModule } from '../ops/ops.module';

@Module({
  imports: [ConfigModule, PrismaModule, OrderModule, OpsModule],
  controllers: [AdminKargonomiController, KargonomiWebhookController],
  providers: [KargonomiService, KargonomiOrderService],
  exports: [KargonomiService, KargonomiOrderService],
})
export class KargonomiModule {}
