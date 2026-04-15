import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import sharp from 'sharp';
import * as crypto from 'crypto';
import * as net from 'net';
import * as fs from 'fs/promises';
import * as pathModule from 'path';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private minioClient?: Minio.Client;
  private bucket: string;
  private useLocalStorage = false;

  // Allowed MIME types
  private readonly ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
  ];

  private readonly ALLOWED_DOCUMENT_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    const accessKey = this.config.get('minio.accessKey');
    const secretKey = this.config.get('minio.secretKey');
    const storageDriver = (this.config.get<string>('STORAGE_DRIVER') || '').toLowerCase();

    this.bucket = this.config.get('minio.bucket') || 'olentia-media';

    if (storageDriver !== 'minio' && storageDriver !== 's3') {
      this.useLocalStorage = true;
      this.logger.warn('UploadService will use local disk storage. Set STORAGE_DRIVER=minio to enable MinIO/S3.');
      return;
    }

    if (!accessKey || !secretKey) {
      this.useLocalStorage = true;
      this.logger.warn('MinIO credentials not configured — UploadService will use local disk storage');
      return;
    }

    this.minioClient = new Minio.Client({
      endPoint: this.config.get('minio.endpoint') || 'localhost',
      port: parseInt(this.config.get('minio.port') || '9002'),
      useSSL: this.config.get('minio.useSSL') === 'true',
      accessKey,
      secretKey,
    });

    void this.ensureBucket();
  }

  private async ensureBucket() {
    if (this.useLocalStorage || !this.minioClient) return;

    try {
      const exists = await this.minioClient.bucketExists(this.bucket);
      if (!exists) {
        await this.minioClient.makeBucket(this.bucket);
        // Make bucket public for read
        const policy = {
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { AWS: ['*'] },
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${this.bucket}/*`],
            },
          ],
        };
        await this.minioClient.setBucketPolicy(
          this.bucket,
          JSON.stringify(policy),
        );
        this.logger.log(`Bucket ${this.bucket} created`);
      }
    } catch (error) {
      this.logger.error('Failed to ensure bucket', error);
    }
  }

  private async writeLocalFile(folder: string, filename: string, buffer: Buffer) {
    const uploadRoot = pathModule.join(process.cwd(), 'uploads');
    const targetDir = pathModule.join(uploadRoot, folder);
    await fs.mkdir(targetDir, { recursive: true });
    await fs.writeFile(pathModule.join(targetDir, filename), buffer);
    return `/uploads/${folder}/${filename}`;
  }

  private async deleteLocalFile(filePath: string) {
    if (!filePath) return;
    const uploadRoot = pathModule.join(process.cwd(), 'uploads');
    const relativePath = filePath.replace(/^\/?uploads\//, '');
    const target = pathModule.join(uploadRoot, relativePath);
    try {
      await fs.unlink(target);
    } catch {}
  }

  /**
   * Upload image with resize/optimize
   */
  async uploadImage(
    file: Express.Multer.File,
    options: {
      entityType?: string;
      entityId?: string;
      uploadedBy?: string;
      maxWidth?: number;
      maxHeight?: number;
      quality?: number;
    } = {},
  ) {
    // Validate MIME type
    if (!this.ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Desteklenmeyen dosya tipi. İzin verilenler: ${this.ALLOWED_IMAGE_TYPES.join(', ')}`,
      );
    }

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      throw new BadRequestException('Dosya boyutu maksimum 10MB olmalı');
    }

    // ClamAV virus scan
    await this.ensureClean(file);

    const { maxWidth = 1200, maxHeight = 1200, quality = 80 } = options;

    // Process image with sharp
    const processedBuffer = await sharp(file.buffer)
      .resize(maxWidth, maxHeight, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality })
      .toBuffer();

    // Generate unique filename
    const hash = crypto.randomBytes(8).toString('hex');
    const filename = `${Date.now()}-${hash}.webp`;
    const folder = options.entityType || 'images';
    const path = `${folder}/${filename}`;

    let url: string;

    if (this.useLocalStorage || !this.minioClient) {
      url = await this.writeLocalFile(folder, filename, processedBuffer);
    } else {
      await this.minioClient.putObject(
        this.bucket,
        path,
        processedBuffer,
        processedBuffer.length,
        { 'Content-Type': 'image/webp' },
      );
      url = `http://${this.config.get('minio.endpoint')}:${this.config.get('minio.port')}/${this.bucket}/${path}`;
    }

    // Save to database
    const uploadedFile = await this.prisma.uploadedFile.create({
      data: {
        filename,
        originalName: file.originalname,
        mimeType: 'image/webp',
        size: processedBuffer.length,
        bucket: this.bucket,
        path,
        url,
        uploadedBy: options.uploadedBy,
        entityType: options.entityType,
        entityId: options.entityId,
        isPublic: true,
      },
    });

    return uploadedFile;
  }

  /**
   * Upload document (PDF, etc.) - no processing
   */
  async uploadDocument(
    file: Express.Multer.File,
    options: {
      entityType?: string;
      entityId?: string;
      uploadedBy?: string;
      isPublic?: boolean;
    } = {},
  ) {
    // Validate MIME type
    const allowedTypes = [
      ...this.ALLOWED_IMAGE_TYPES,
      ...this.ALLOWED_DOCUMENT_TYPES,
    ];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Desteklenmeyen dosya tipi');
    }

    // Validate size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      throw new BadRequestException('Dosya boyutu maksimum 50MB olmalı');
    }

    // ClamAV virus scan
    await this.ensureClean(file);

    // Generate unique filename
    const hash = crypto.randomBytes(8).toString('hex');
    const ext = file.originalname.split('.').pop() || 'bin';
    const filename = `${Date.now()}-${hash}.${ext}`;
    const folder = options.entityType || 'documents';
    const path = `${folder}/${filename}`;

    let url: string | null = null;

    if (this.useLocalStorage || !this.minioClient) {
      const localUrl = await this.writeLocalFile(folder, filename, file.buffer);
      url = options.isPublic !== false ? localUrl : null;
    } else {
      await this.minioClient.putObject(
        this.bucket,
        path,
        file.buffer,
        file.size,
        { 'Content-Type': file.mimetype },
      );
      url =
        options.isPublic !== false
          ? `http://${this.config.get('minio.endpoint')}:${this.config.get('minio.port')}/${this.bucket}/${path}`
          : null;
    }

    // Save to database
    const uploadedFile = await this.prisma.uploadedFile.create({
      data: {
        filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        bucket: this.bucket,
        path,
        url,
        uploadedBy: options.uploadedBy,
        entityType: options.entityType,
        entityId: options.entityId,
        isPublic: options.isPublic !== false,
      },
    });

    return uploadedFile;
  }

  /**
   * Delete file
   */
  async deleteFile(fileId: string) {
    const file = await this.prisma.uploadedFile.findUnique({
      where: { id: fileId },
    });

    if (!file) return;

    try {
      if (this.useLocalStorage || !this.minioClient) {
        await this.deleteLocalFile(file.url || file.path);
      } else {
        await this.minioClient.removeObject(file.bucket, file.path);
      }
      await this.prisma.uploadedFile.delete({ where: { id: fileId } });
    } catch (error) {
      this.logger.error(`Failed to delete file ${fileId}`, error);
    }
  }

  /**
   * Generate presigned URL for private files
   */
  async getPresignedUrl(fileId: string, expirySeconds = 3600): Promise<string> {
    const file = await this.prisma.uploadedFile.findUnique({
      where: { id: fileId },
    });

    if (!file) throw new BadRequestException('Dosya bulunamadı');

    if (this.useLocalStorage || !this.minioClient) {
      if (!file.url) throw new BadRequestException('Dosya herkese acik degil');
      return file.url;
    }

    return this.minioClient.presignedGetObject(
      file.bucket,
      file.path,
      expirySeconds,
    );
  }

  /**
   * Create image thumbnails
   */
  async createThumbnail(
    file: Express.Multer.File,
    width = 200,
    height = 200,
  ): Promise<Buffer> {
    return sharp(file.buffer)
      .resize(width, height, { fit: 'cover' })
      .webp({ quality: 70 })
      .toBuffer();
  }

  // ============================================
  // ClamAV VIRUS SCAN
  // ============================================

  /**
   * ClamAV ile dosya tarama
   * ClamAV daemon (clamd) TCP üzerinden bağlanır.
   * Docker'da: clamav container port 3310
   *
   * Kullanım: uploadImage/uploadDocument içinde otomatik çağrılır
   * ClamAV yoksa/kapalıysa dosya kabul edilir (graceful degradation)
   */
  async scanFile(buffer: Buffer): Promise<{ clean: boolean; virus?: string }> {
    const clamHost = this.config.get('CLAMAV_HOST') || 'localhost';
    const clamPort = parseInt(this.config.get('CLAMAV_PORT') || '3310');
    const scanEnabled = this.config.get('CLAMAV_ENABLED') !== 'false';

    if (!scanEnabled) {
      return { clean: true };
    }

    return new Promise((resolve) => {
      const socket = new net.Socket();
      let response = '';

      // Timeout: ClamAV cevap vermezse dosyayı kabul et
      socket.setTimeout(10000);

      socket.on('timeout', () => {
        this.logger.error(
          'ClamAV timeout — dosya reddedildi (güvenlik nedeniyle)',
        );
        socket.destroy();
        resolve({ clean: false, virus: 'SCAN_TIMEOUT' });
      });

      socket.on('error', (err) => {
        this.logger.error(
          `ClamAV bağlantı hatası: ${err.message} — dosya reddedildi`,
        );
        resolve({ clean: false, virus: 'SCAN_UNAVAILABLE' });
      });

      socket.on('data', (data) => {
        response += data.toString();
      });

      socket.on('end', () => {
        // ClamAV cevabı: "stream: OK" veya "stream: VirusName FOUND"
        if (response.includes('FOUND')) {
          const virusName = response
            .replace('stream: ', '')
            .replace(' FOUND', '')
            .trim();
          this.logger.error(`🦠 Virus tespit edildi: ${virusName}`);
          resolve({ clean: false, virus: virusName });
        } else {
          resolve({ clean: true });
        }
      });

      socket.connect(clamPort, clamHost, () => {
        // INSTREAM komutu: boyut + veri gönder
        socket.write('zINSTREAM\0');

        // Chunk boyutunu 4-byte big-endian olarak gönder
        const sizeBuffer = Buffer.alloc(4);
        sizeBuffer.writeUInt32BE(buffer.length, 0);
        socket.write(sizeBuffer);
        socket.write(buffer);

        // Son chunk: 0 boyutunda (stream sonu)
        const endBuffer = Buffer.alloc(4);
        endBuffer.writeUInt32BE(0, 0);
        socket.write(endBuffer);
      });
    });
  }

  /**
   * Upload öncesi virus tarama wrapper
   */
  private async ensureClean(file: Express.Multer.File): Promise<void> {
    const result = await this.scanFile(file.buffer);
    if (!result.clean) {
      throw new BadRequestException(
        `Dosya güvenlik taramasından geçemedi. Tespit edilen tehdit: ${result.virus}`,
      );
    }
  }
}
