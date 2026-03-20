import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SttService } from './stt.service';

@ApiTags('AI - Speech to Text')
@ApiBearerAuth()
@Controller('ai/stt')
export class SttController {
  constructor(private readonly sttService: SttService) {}

  @Post('transcribe')
  @ApiOperation({ summary: 'Ses dosyasını metne çevir' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('audio'))
  async transcribe(
    @UploadedFile() file: Express.Multer.File,
    @Query('language') language?: string,
  ) {
    return this.sttService.transcribe(file.buffer, language || 'tr');
  }
}
