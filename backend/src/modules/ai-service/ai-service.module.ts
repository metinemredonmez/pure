import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SttService } from './stt/stt.service';
import { SttController } from './stt/stt.controller';
import { TtsService } from './tts/tts.service';
import { TtsController } from './tts/tts.controller';
import { ChatboxService } from './chatbox/chatbox.service';
import { ChatboxController } from './chatbox/chatbox.controller';
import { AnalysisService } from './analysis/analysis.service';
import { AnalysisController } from './analysis/analysis.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [ConfigModule, PrismaModule],
  controllers: [
    SttController,
    TtsController,
    ChatboxController,
    AnalysisController,
  ],
  providers: [SttService, TtsService, ChatboxService, AnalysisService],
  exports: [SttService, TtsService, ChatboxService, AnalysisService],
})
export class AiServiceModule {}
