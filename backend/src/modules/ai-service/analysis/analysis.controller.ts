import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../../common/decorators/roles.decorator';
import { AnalysisService } from './analysis.service';

class AnalysisQueryDto {
  question: string;
}

@ApiTags('AI - Analiz & Günlük Rapor')
@ApiBearerAuth()
@Controller('ai/analysis')
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Get('daily-report')
  @Roles('ADMIN' as any)
  @ApiOperation({
    summary: 'Günlük analiz raporu — Sabah açılış modu',
    description:
      'Gece boyunca toplanan verilerden günlük rapor. Siparişler, ciro, yeni müşteriler, stok uyarıları, takvim.',
  })
  async getDailyReport(@Query('date') date?: string) {
    const targetDate = date ? new Date(date) : undefined;
    return this.analysisService.generateDailyReport(targetDate);
  }

  @Get('voice-report')
  @Roles('ADMIN' as any)
  @ApiOperation({
    summary: 'Sesli rapor metni — TTS ile okunacak',
    description:
      'Günlük raporu sesli dinlemek için optimize edilmiş metin. Admin sabah gelince sesli olarak neler olduğunu dinler.',
  })
  async getVoiceReport(@Query('date') date?: string) {
    const targetDate = date ? new Date(date) : undefined;
    const text = await this.analysisService.generateVoiceReport(targetDate);
    return { text, readyForTts: true };
  }

  @Post('query')
  @Roles('ADMIN' as any)
  @ApiOperation({
    summary: 'Doğal dil ile analiz sorgusu (Phase 2)',
    description:
      'Örn: "Bu hafta en çok satan kahve hangisi?", "B2B lead dönüşüm oranı nedir?"',
  })
  async queryAnalysis(@Body() dto: AnalysisQueryDto) {
    return this.analysisService.queryAnalysis(dto.question);
  }
}
