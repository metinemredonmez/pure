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
import {
  UpdateTemplateDto,
  SendEmailDto,
  SendTemplatedEmailDto,
  SendInAppDto,
  CreateTemplateDto,
} from './dto/notification.dto';

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
      user.id,
      page,
      limit,
      unreadOnly === 'true',
    );
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Bildirimi okundu olarak işaretle' })
  markAsRead(@CurrentUser() user: any, @Param('id') id: string) {
    return this.notificationService.markAsRead(user.id, id);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Tüm bildirimleri okundu yap' })
  markAllAsRead(@CurrentUser() user: any) {
    return this.notificationService.markAllAsRead(user.id);
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
  sendEmail(@Body() dto: SendEmailDto) {
    return this.notificationService.sendEmail(dto.to, dto.subject, dto.html);
  }

  @Roles(UserRole.ADMIN)
  @Post('send-template')
  @ApiOperation({ summary: 'Send templated email (admin)' })
  sendTemplated(@Body() dto: SendTemplatedEmailDto) {
    return this.notificationService.sendTemplatedEmail(
      dto.to,
      dto.template,
      dto.variables,
    );
  }

  @Roles(UserRole.ADMIN)
  @Post('send-inapp')
  @ApiOperation({ summary: 'Kullanıcıya anlık bildirim gönder (admin)' })
  sendInApp(@Body() dto: SendInAppDto) {
    return this.notificationService.sendInApp(
      dto.userId,
      dto.title,
      dto.message,
      dto.type,
      dto.link,
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
  createTemplate(@Body() dto: CreateTemplateDto) {
    return this.notificationService.createTemplate(dto);
  }

  @Roles(UserRole.ADMIN)
  @Put('templates/:id')
  @ApiOperation({ summary: 'Update email template (admin)' })
  updateTemplate(@Param('id') id: string, @Body() dto: UpdateTemplateDto) {
    return this.notificationService.updateTemplate(id, dto);
  }

  @Roles(UserRole.ADMIN)
  @Get('logs')
  @ApiOperation({ summary: 'View sent notification logs (admin)' })
  findLogs(@Query('limit') limit?: number) {
    return this.notificationService.findSentNotifications(limit || 50);
  }
}
