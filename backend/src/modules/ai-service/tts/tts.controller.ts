import { Controller, Post, Body, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { TtsService } from './tts.service';

class SynthesizeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  text: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  voice?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
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
