import { Module } from '@nestjs/common';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';
import { PaymentModule } from '../payment/payment.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [PaymentModule, NotificationModule],
  controllers: [SubscriptionController],
  providers: [SubscriptionService],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
