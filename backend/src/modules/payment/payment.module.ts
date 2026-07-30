import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { NotificationModule } from '../notification/notification.module';
import { InvoiceModule } from '../invoice/invoice.module';

@Module({
  imports: [NotificationModule, InvoiceModule],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
