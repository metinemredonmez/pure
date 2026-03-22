import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
  UseGuards,
  Req,
  Logger,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../modules/identity/guards/jwt-auth.guard';
import * as multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Ensure upload directories exist
['images', 'products', 'blog', 'documents', 'avatars'].forEach((dir) => {
  const fullPath = path.join(UPLOAD_DIR, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(UPLOAD_DIR, 'images'));
  },
  filename: (_req, file, cb) => {
    const hash = crypto.randomBytes(8).toString('hex');
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `${Date.now()}-${hash}${ext}`);
  },
});

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf',
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new BadRequestException(`Desteklenmeyen dosya tipi: ${file.mimetype}`));
  }
};

@Controller('upload')
export class UploadController {
  private readonly logger = new Logger(UploadController.name);

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage,
      fileFilter,
      limits: { fileSize: MAX_FILE_SIZE },
    }),
  )
  async uploadSingle(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('Dosya yüklenmedi');
    }

    this.logger.log(
      `File uploaded: ${file.originalname} -> ${file.filename} by ${req.user?.email || 'unknown'}`,
    );

    const url = `/uploads/images/${file.filename}`;

    return {
      success: true,
      data: {
        url,
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
      },
    };
  }

  @Post('multiple')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FilesInterceptor('files', 5, {
      storage,
      fileFilter,
      limits: { fileSize: MAX_FILE_SIZE },
    }),
  )
  async uploadMultiple(
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: any,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Dosya yüklenmedi');
    }

    this.logger.log(
      `${files.length} files uploaded by ${req.user?.email || 'unknown'}`,
    );

    const urls = files.map((file) => `/uploads/images/${file.filename}`);
    const data = files.map((file) => ({
      url: `/uploads/images/${file.filename}`,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
    }));

    return {
      success: true,
      data,
      urls,
    };
  }
}
