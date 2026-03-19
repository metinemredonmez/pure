import { Module } from '@nestjs/common';
import { NotificationController, UserNotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [NotificationController, UserNotificationController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
