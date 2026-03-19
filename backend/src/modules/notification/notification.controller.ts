import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Notifications')
@ApiBearerAuth('access-token')
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
  sendTemplated(@Body() body: { to: string; template: string; variables: Record<string, string> }) {
    return this.notificationService.sendTemplatedEmail(body.to, body.template, body.variables);
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
  createTemplate(@Body() data: { name: string; channel: string; subject?: string; body: string }) {
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
