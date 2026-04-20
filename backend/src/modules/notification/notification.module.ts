import { Module } from '@nestjs/common';
import {
  NotificationController,
  UserNotificationController,
} from './notification.controller';
import { NotificationService } from './notification.service';
import { BroadcastController } from './broadcast.controller';
import { BroadcastService } from './broadcast.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [NotificationController, UserNotificationController, BroadcastController],
  providers: [NotificationService, BroadcastService],
  exports: [NotificationService, BroadcastService],
})
export class NotificationModule {}
