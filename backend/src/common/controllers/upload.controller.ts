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

// Extension whitelist — defence-in-depth alongside mimetype + magic-byte checks.
const ALLOWED_EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.pdf'];
const ALLOWED_MIMES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
];

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const ext = path.extname(file.originalname || '').toLowerCase();
  if (!ALLOWED_EXTS.includes(ext)) {
    return cb(new BadRequestException(`Desteklenmeyen dosya uzantisi: ${ext}`));
  }
  if (!ALLOWED_MIMES.includes(file.mimetype)) {
    return cb(new BadRequestException(`Desteklenmeyen dosya tipi: ${file.mimetype}`));
  }
  cb(null, true);
};

// Verify actual file content matches declared type (magic bytes).
// Returns true if the declared mimetype matches real file header.
function verifyMagicBytes(filePath: string, mimetype: string): boolean {
  try {
    const fd = fs.openSync(filePath, 'r');
    const buf = Buffer.alloc(12);
    fs.readSync(fd, buf, 0, 12, 0);
    fs.closeSync(fd);

    // JPEG: FF D8 FF
    if (mimetype === 'image/jpeg') return buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
    // PNG: 89 50 4E 47 0D 0A 1A 0A
    if (mimetype === 'image/png')
      return buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47;
    // WebP: RIFF....WEBP
    if (mimetype === 'image/webp')
      return buf.slice(0, 4).toString() === 'RIFF' && buf.slice(8, 12).toString() === 'WEBP';
    // GIF: GIF87a or GIF89a
    if (mimetype === 'image/gif') return buf.slice(0, 3).toString() === 'GIF';
    // PDF: %PDF-
    if (mimetype === 'application/pdf') return buf.slice(0, 5).toString() === '%PDF-';
    return false;
  } catch {
    return false;
  }
}

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

    // Magic-byte validation: client mime/ext can lie
    if (!verifyMagicBytes(file.path, file.mimetype)) {
      fs.unlinkSync(file.path);
      this.logger.warn(
        `Rejected upload (magic-byte mismatch): ${file.originalname} from ${req.user?.email || 'unknown'}`,
      );
      throw new BadRequestException('Dosya içeriği beyan edilen tip ile eşleşmiyor');
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

    // Magic-byte validation
    for (const file of files) {
      if (!verifyMagicBytes(file.path, file.mimetype)) {
        // Clean up all files already saved in this batch
        for (const f of files) {
          try { fs.unlinkSync(f.path); } catch {}
        }
        this.logger.warn(
          `Rejected batch upload (magic-byte mismatch): ${file.originalname}`,
        );
        throw new BadRequestException(
          `Dosya içeriği beyan edilen tip ile eşleşmiyor: ${file.originalname}`,
        );
      }
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
