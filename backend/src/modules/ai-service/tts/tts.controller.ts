import { Controller, Post, Body, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TtsService } from './tts.service';

class SynthesizeDto {
  text: string;
  voice?: string;
  language?: string;
}

@ApiTags('AI - Text to Speech')
@ApiBearerAuth()
@Controller('ai/tts')
export class TtsController {
  constructor(private readonly ttsService: TtsService) {}

  @Post('synthesize')
  @ApiOperation({ summary: 'Metni sese çevir' })
  async synthesize(@Body() dto: SynthesizeDto) {
    return this.ttsService.synthesize(dto.text, dto.voice, dto.language);
  }

  @Get('voices')
  @ApiOperation({ summary: 'Kullanılabilir ses modellerini listele' })
  getVoices() {
    return this.ttsService.getAvailableVoices();
  }
}
