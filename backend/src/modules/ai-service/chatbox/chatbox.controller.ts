import { Controller, Post, Body, Get, Param, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Public } from '../../../common/decorators/public.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ChatboxService } from './chatbox.service';
import { v4 as uuidv4 } from 'uuid';

class ChatDto {
  message: string;
}

@ApiTags('AI - Chatbox')
@Controller('ai/chat')
export class ChatboxController {
  constructor(private readonly chatboxService: ChatboxService) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'AI asistana mesaj gönder (site sağ panel)' })
  async chat(
    @Body() dto: ChatDto,
    @Headers('x-session-id') sessionId?: string,
    @CurrentUser() user?: any,
  ) {
    const sid = sessionId || uuidv4();
    return this.chatboxService.chat(dto.message, sid, user?.sub);
  }

  @Get('history/:sessionId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Konuşma geçmişini getir' })
  async getHistory(@Param('sessionId') sessionId: string) {
    return this.chatboxService.getSessionHistory(sessionId);
  }
}
