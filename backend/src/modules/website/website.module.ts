import { Module } from '@nestjs/common';
import { NotificationModule } from '../notification/notification.module';
import { WebsiteController } from './website.controller';
import { WebsiteService } from './website.service';

@Module({
  imports: [NotificationModule],
  controllers: [WebsiteController],
  providers: [WebsiteService],
  exports: [WebsiteService],
})
export class WebsiteModule {}
