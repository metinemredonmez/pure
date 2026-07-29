import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsArray, IsEnum, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { BroadcastService } from './broadcast.service';
import type { BroadcastAudience, BroadcastChannel } from './broadcast.service';

class SendBroadcastDto {
  @IsIn(['ALL', 'CUSTOMERS', 'SUBSCRIBERS', 'NEWSLETTER', 'MANUAL'])
  audience!: BroadcastAudience;

  @IsIn(['EMAIL', 'PUSH'])
  channel!: BroadcastChannel;

  @IsString()
  @MaxLength(300)
  subject!: string;

  @IsString()
  body!: string;

  @IsOptional()
  @IsArray()
  manualEmails?: string[];
}

class PreviewDto {
  @IsIn(['ALL', 'CUSTOMERS', 'SUBSCRIBERS', 'NEWSLETTER', 'MANUAL'])
  audience!: BroadcastAudience;

  @IsOptional()
  @IsArray()
  manualEmails?: string[];
}

@ApiTags('Broadcasts')
@ApiBearerAuth('access-token')
@Controller('admin/broadcasts')
export class BroadcastController {
  constructor(private readonly svc: BroadcastService) {}

  @Roles(UserRole.ADMIN)
  @Post('preview')
  @ApiOperation({ summary: 'Estimate audience size before sending' })
  preview(@Body() dto: PreviewDto) {
    return this.svc.previewAudience(dto.audience, dto.manualEmails);
  }

  @Roles(UserRole.ADMIN)
  @Post('send')
  @ApiOperation({ summary: 'Send broadcast message (email or push)' })
  send(@Body() dto: SendBroadcastDto) {
    return this.svc.send(dto);
  }

  @Roles(UserRole.ADMIN)
  @Get('history')
  @ApiOperation({ summary: 'Recent broadcast history' })
  history(@Query('limit') limit?: string) {
    return this.svc.history(limit ? parseInt(limit) : 50);
  }
}
