import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TtsService {
  private readonly logger = new Logger(TtsService.name);

  constructor(private configService: ConfigService) {}

  /**
   * Text-to-Speech: Metni sese çevirir
   * Phase 2: OpenAI TTS API veya Google Cloud TTS entegrasyonu
   */
  async synthesize(
    text: string,
    voice: string = 'alloy',
    language: string = 'tr',
  ): Promise<{ audioUrl: string; duration: number }> {
    this.logger.log(`TTS request - text length: ${text.length}, voice: ${voice}, language: ${language}`);

    // TODO: Phase 2 - OpenAI TTS API entegrasyonu
    // const openai = new OpenAI({ apiKey: this.configService.get('OPENAI_API_KEY') });
    // const mp3 = await openai.audio.speech.create({
    //   model: 'tts-1',
    //   voice,
    //   input: text,
    // });
    // MinIO'ya yükle ve URL döndür

    return {
      audioUrl: '',
      duration: 0,
    };
  }

  /**
   * Desteklenen ses modelleri
   */
  getAvailableVoices(): { id: string; name: string; language: string }[] {
    return [
      { id: 'alloy', name: 'Alloy', language: 'tr' },
      { id: 'echo', name: 'Echo', language: 'tr' },
      { id: 'fable', name: 'Fable', language: 'tr' },
      { id: 'onyx', name: 'Onyx', language: 'tr' },
      { id: 'nova', name: 'Nova', language: 'tr' },
      { id: 'shimmer', name: 'Shimmer', language: 'tr' },
    ];
  }
}
