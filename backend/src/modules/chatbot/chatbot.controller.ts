import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Headers,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ChatbotService } from './chatbot.service';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Chatbot')
@Controller()
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Public()
  @Post('chatbot/message')
  @ApiOperation({ summary: 'Send chatbot message' })
  sendMessage(
    @Headers('x-session-id') sessionId: string,
    @CurrentUser('id') userId: string,
    @Body() body: { message: string },
  ) {
    return this.chatbotService.sendMessage(
      sessionId,
      userId || null,
      body.message,
    );
  }

  @ApiBearerAuth('access-token')
  @Get('chatbot/history')
  @ApiOperation({ summary: 'Get my chat history (authenticated)' })
  getMyHistory(@CurrentUser('id') userId: string) {
    return this.chatbotService.getSessionHistoryByUser(userId);
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN, UserRole.SUPPORT)
  @Get('admin/chatbot/sessions')
  @ApiOperation({ summary: 'List chatbot sessions (admin)' })
  findAllSessions(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.chatbotService.findAllSessions(page, limit);
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN, UserRole.SUPPORT)
  @Get('admin/chatbot/sessions/:sessionId')
  @ApiOperation({ summary: 'Get session history (admin)' })
  getSessionHistory(@Param('sessionId') sessionId: string) {
    return this.chatbotService.getSessionHistory(sessionId);
  }
}
