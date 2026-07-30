import { Module } from '@nestjs/common';
import { ShippingService } from './shipping.service';
import {
  AdminShippingController,
  UserShippingController,
  ShippingWebhookController,
  PublicShippingController,
} from './shipping.controller';
import { YurticiCarrier } from './carriers/yurtici.carrier';
import { ArasCarrier } from './carriers/aras.carrier';
import { MngCarrier } from './carriers/mng.carrier';
import { PrismaModule } from '../../prisma/prisma.module';
import { OpsModule } from '../ops/ops.module';
import { IdentityModule } from '../identity/identity.module';
import { OrderModule } from '../order/order.module';

@Module({
  imports: [PrismaModule, OpsModule, IdentityModule, OrderModule],
  controllers: [
    AdminShippingController,
    UserShippingController,
    ShippingWebhookController,
    PublicShippingController,
  ],
  providers: [ShippingService, YurticiCarrier, ArasCarrier, MngCarrier],
  exports: [ShippingService],
})
export class ShippingModule {}
