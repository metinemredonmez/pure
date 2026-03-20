import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import sharp from 'sharp';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private minioClient: Minio.Client;
  private bucket: string;

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
    this.minioClient = new Minio.Client({
      endPoint: this.config.get('minio.endpoint') || 'localhost',
      port: parseInt(this.config.get('minio.port') || '9002'),
      useSSL: this.config.get('minio.useSSL') === 'true',
      accessKey: this.config.get('minio.accessKey') || 'olentia_minio',
      secretKey: this.config.get('minio.secretKey') || 'olentia_minio_secret',
    });

    this.bucket = this.config.get('minio.bucket') || 'olentia-media';
    this.ensureBucket();
  }

  private async ensureBucket() {
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

    // Upload to MinIO
    await this.minioClient.putObject(
      this.bucket,
      path,
      processedBuffer,
      processedBuffer.length,
      { 'Content-Type': 'image/webp' },
    );

    // Generate URL
    const url = `http://${this.config.get('minio.endpoint')}:${this.config.get('minio.port')}/${this.bucket}/${path}`;

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

    // Generate unique filename
    const hash = crypto.randomBytes(8).toString('hex');
    const ext = file.originalname.split('.').pop() || 'bin';
    const filename = `${Date.now()}-${hash}.${ext}`;
    const folder = options.entityType || 'documents';
    const path = `${folder}/${filename}`;

    // Upload to MinIO
    await this.minioClient.putObject(
      this.bucket,
      path,
      file.buffer,
      file.size,
      { 'Content-Type': file.mimetype },
    );

    // Generate URL
    const url =
      options.isPublic !== false
        ? `http://${this.config.get('minio.endpoint')}:${this.config.get('minio.port')}/${this.bucket}/${path}`
        : null;

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
      await this.minioClient.removeObject(file.bucket, file.path);
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
}
