import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  MaxLength,
  IsDateString,
} from 'class-validator';

// ══════════════════════════════════════════════
// BLOG POST DTOs
// ══════════════════════════════════════════════

export class CreateBlogPostDto {
  @ApiProperty({ example: 'Kahve Demleme Rehberi' })
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiProperty({ example: 'kahve-demleme-rehberi' })
  @IsString()
  @MaxLength(255)
  slug: string;

  @ApiPropertyOptional({ example: 'En iyi kahve demleme teknikleri...' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  excerpt?: string;

  @ApiProperty({ example: '## Giriş\nKahve demleme bir sanattır...' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ example: 'https://example.com/cover.jpg' })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiPropertyOptional({ example: 'user-id-123' })
  @IsOptional()
  @IsString()
  authorId?: string;

  @ApiPropertyOptional({ example: 'category-id-123' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ example: ['kahve', 'demleme', 'rehber'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({ example: '2024-01-15T10:00:00Z' })
  @IsOptional()
  @IsDateString()
  publishedAt?: string;

  @ApiPropertyOptional({ example: 'Kahve Demleme Rehberi | Olentia' })
  @IsOptional()
  @IsString()
  @MaxLength(70)
  seoTitle?: string;

  @ApiPropertyOptional({ example: 'En iyi kahve demleme tekniklerini öğrenin' })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  seoDescription?: string;
}

export class UpdateBlogPostDto {
  @ApiPropertyOptional({ example: 'Kahve Demleme Rehberi' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({ example: 'kahve-demleme-rehberi' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  slug?: string;

  @ApiPropertyOptional({ example: 'En iyi kahve demleme teknikleri...' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  excerpt?: string;

  @ApiPropertyOptional({ example: '## Giriş\nKahve demleme bir sanattır...' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ example: 'https://example.com/cover.jpg' })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiPropertyOptional({ example: 'user-id-123' })
  @IsOptional()
  @IsString()
  authorId?: string;

  @ApiPropertyOptional({ example: 'category-id-123' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ example: ['kahve', 'demleme', 'rehber'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({ example: '2024-01-15T10:00:00Z' })
  @IsOptional()
  @IsDateString()
  publishedAt?: string;

  @ApiPropertyOptional({ example: 'Kahve Demleme Rehberi | Olentia' })
  @IsOptional()
  @IsString()
  @MaxLength(70)
  seoTitle?: string;

  @ApiPropertyOptional({ example: 'En iyi kahve demleme tekniklerini öğrenin' })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  seoDescription?: string;
}

// ══════════════════════════════════════════════
// SEO DTOs
// ══════════════════════════════════════════════

export class UpsertSeoDto {
  @ApiPropertyOptional({ example: 'Olentia - Premium Kahve' })
  @IsOptional()
  @IsString()
  @MaxLength(70)
  title?: string;

  @ApiPropertyOptional({ example: 'En kaliteli Etiyopya ve Kenya kahveleri' })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  description?: string;

  @ApiPropertyOptional({ example: 'https://example.com/og-image.jpg' })
  @IsOptional()
  @IsString()
  ogImage?: string;

  @ApiPropertyOptional({ example: ['kahve', 'specialty coffee', 'olentia'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];
}
