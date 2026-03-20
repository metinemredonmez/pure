import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Body,
  Param,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

// ============================================
// KULLANICI BİLDİRİMLERİ (In-App)
// ============================================

@ApiTags('Bildirimler — Kullanıcı')
@ApiBearerAuth()
@Controller('notifications')
export class UserNotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: 'Bildirimlerimi getir' })
  getMyNotifications(
    @CurrentUser() user: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('unreadOnly') unreadOnly?: string,
  ) {
    return this.notificationService.getUserNotifications(
      user.sub,
      page,
      limit,
      unreadOnly === 'true',
    );
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Bildirimi okundu olarak işaretle' })
  markAsRead(@CurrentUser() user: any, @Param('id') id: string) {
    return this.notificationService.markAsRead(user.sub, id);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Tüm bildirimleri okundu yap' })
  markAllAsRead(@CurrentUser() user: any) {
    return this.notificationService.markAllAsRead(user.sub);
  }
}

// ============================================
// ADMIN BİLDİRİM YÖNETİMİ
// ============================================

@ApiTags('Bildirimler — Admin')
@ApiBearerAuth()
@Controller('admin/notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Roles(UserRole.ADMIN)
  @Post('send')
  @ApiOperation({ summary: 'Send custom email (admin)' })
  sendEmail(@Body() body: { to: string; subject: string; html: string }) {
    return this.notificationService.sendEmail(body.to, body.subject, body.html);
  }

  @Roles(UserRole.ADMIN)
  @Post('send-template')
  @ApiOperation({ summary: 'Send templated email (admin)' })
  sendTemplated(
    @Body()
    body: {
      to: string;
      template: string;
      variables: Record<string, string>;
    },
  ) {
    return this.notificationService.sendTemplatedEmail(
      body.to,
      body.template,
      body.variables,
    );
  }

  @Roles(UserRole.ADMIN)
  @Post('send-inapp')
  @ApiOperation({ summary: 'Kullanıcıya anlık bildirim gönder (admin)' })
  sendInApp(
    @Body()
    body: {
      userId: string;
      title: string;
      message: string;
      type?: string;
      link?: string;
    },
  ) {
    return this.notificationService.sendInApp(
      body.userId,
      body.title,
      body.message,
      body.type,
      body.link,
    );
  }

  @Roles(UserRole.ADMIN)
  @Get('templates')
  @ApiOperation({ summary: 'List email templates (admin)' })
  findAllTemplates() {
    return this.notificationService.findAllTemplates();
  }

  @Roles(UserRole.ADMIN)
  @Post('templates')
  @ApiOperation({ summary: 'Create email template (admin)' })
  createTemplate(
    @Body()
    data: {
      name: string;
      channel: string;
      subject?: string;
      body: string;
    },
  ) {
    return this.notificationService.createTemplate(data);
  }

  @Roles(UserRole.ADMIN)
  @Put('templates/:id')
  @ApiOperation({ summary: 'Update email template (admin)' })
  updateTemplate(@Param('id') id: string, @Body() data: any) {
    return this.notificationService.updateTemplate(id, data);
  }

  @Roles(UserRole.ADMIN)
  @Get('logs')
  @ApiOperation({ summary: 'View sent notification logs (admin)' })
  findLogs(@Query('limit') limit?: number) {
    return this.notificationService.findSentNotifications(limit || 50);
  }
}
