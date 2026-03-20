import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SttService {
  private readonly logger = new Logger(SttService.name);

  constructor(private configService: ConfigService) {}

  /**
   * Speech-to-Text: Ses dosyasını metne çevirir
   * Phase 2: OpenAI Whisper API veya Google Cloud Speech-to-Text entegrasyonu
   */
  async transcribe(
    audioBuffer: Buffer,
    language: string = 'tr',
  ): Promise<{ text: string; confidence: number }> {
    this.logger.log(
      `STT request received - language: ${language}, size: ${audioBuffer.length} bytes`,
    );

    // TODO: Phase 2 - OpenAI Whisper API entegrasyonu
    // const openai = new OpenAI({ apiKey: this.configService.get('OPENAI_API_KEY') });
    // const transcription = await openai.audio.transcriptions.create({
    //   file: audioBuffer,
    //   model: 'whisper-1',
    //   language,
    // });

    return {
      text: "[STT servis hazır - Phase 2'de aktif olacak]",
      confidence: 0,
    };
  }

  /**
   * Gerçek zamanlı STT stream desteği
   */
  async transcribeStream(
    audioStream: NodeJS.ReadableStream,
    language: string = 'tr',
  ): Promise<AsyncGenerator<string>> {
    this.logger.log(`STT stream request - language: ${language}`);

    // TODO: Phase 2 - WebSocket tabanlı gerçek zamanlı STT
    async function* generate() {
      yield "[STT stream hazır - Phase 2'de aktif olacak]";
    }

    return generate();
  }
}
