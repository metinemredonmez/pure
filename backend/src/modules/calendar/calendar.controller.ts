import {
  Controller, Get, Post, Put, Delete, Body, Param, Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CalendarService } from './calendar.service';

@ApiTags('Calendar')
@ApiBearerAuth('access-token')
@Roles('ADMIN', 'SALES')
@Controller('admin/calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get('events')
  @ApiOperation({ summary: 'List calendar events' })
  getEvents(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('type') type?: string,
  ) {
    return this.calendarService.getEvents({ startDate, endDate, type });
  }

  @Post('events')
  @ApiOperation({ summary: 'Create calendar event' })
  createEvent(@Body() body: any, @CurrentUser('id') userId: string) {
    return this.calendarService.createEvent({ ...body, createdBy: userId });
  }

  @Put('events/:id')
  @ApiOperation({ summary: 'Update calendar event' })
  updateEvent(@Param('id') id: string, @Body() body: any) {
    return this.calendarService.updateEvent(id, body);
  }

  @Delete('events/:id')
  @ApiOperation({ summary: 'Delete calendar event' })
  deleteEvent(@Param('id') id: string) {
    return this.calendarService.deleteEvent(id);
  }
}
