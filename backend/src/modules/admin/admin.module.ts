import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { CouponsPublicController } from './coupons-public.controller';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [NotificationModule],
  controllers: [AdminController, CouponsPublicController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
