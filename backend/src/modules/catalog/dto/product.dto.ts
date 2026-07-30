import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsBoolean,
  IsArray,
  IsInt,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { ProductStatus, RoastLevel } from '@prisma/client';

export class CreateProductDto {
  @ApiProperty({ example: 'Ethiopia Yirgacheffe' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'ethiopia-yirgacheffe' })
  @IsString()
  slug: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  shortDescription?: string;

  @ApiProperty({ example: 'OLN-ETH-001' })
  @IsString()
  sku: string;

  @ApiProperty({ example: 249.9 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ example: 299.9 })
  @IsOptional()
  @IsNumber()
  compareAtPrice?: number;

  @ApiPropertyOptional({ example: 120 })
  @IsOptional()
  @IsNumber()
  costPrice?: number;

  @ApiPropertyOptional({ enum: ProductStatus, default: 'DRAFT' })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 'Ethiopia' })
  @IsOptional()
  @IsString()
  origin?: string;

  @ApiPropertyOptional({ enum: RoastLevel })
  @IsOptional()
  @IsEnum(RoastLevel)
  roastLevel?: RoastLevel;

  @ApiPropertyOptional({ example: ['chocolate', 'hazelnut'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  aromaProfile?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  brewGuide?: string;

  @ApiPropertyOptional({ example: '1800-2200m' })
  @IsOptional()
  @IsString()
  altitude?: string;

  @ApiPropertyOptional({ example: 'Washed' })
  @IsOptional()
  @IsString()
  process?: string;

  @ApiPropertyOptional({ example: 500 })
  @IsOptional()
  @IsInt()
  weight?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ example: 100, default: 0 })
  @IsOptional()
  @IsInt()
  stock?: number;

  @ApiPropertyOptional({ type: 'array', description: 'Product images' })
  @IsOptional()
  @IsArray()
  images?: any[];
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}

export class CreateVariantDto {
  @ApiProperty({ example: 'OLN-ETH-001-500-ESP' })
  @IsString()
  sku: string;

  @ApiProperty({ example: '500g - Espresso Öğütme' })
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  grindType?: string;

  @ApiProperty({ example: 500 })
  @IsInt()
  weight: number;

  @ApiProperty({ example: 249.9 })
  @IsNumber()
  price: number;

  @ApiPropertyOptional({ example: 100, default: 0 })
  @IsOptional()
  @IsInt()
  stock?: number;
}

// Admin varyant editörü için — id varsa güncelle, yoksa ekle. sku/name yoksa üretilir.
export class VariantInputDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'GrindType enum: WHOLE_BEAN|FRENCH_PRESS|V60|FILTER|ESPRESSO|TURKISH' })
  @IsOptional()
  @IsString()
  grindType?: string;

  @ApiPropertyOptional({ description: 'RoastLevel enum: LIGHT|MEDIUM|MEDIUM_DARK|DARK' })
  @IsOptional()
  @IsString()
  roastLevel?: string;

  @ApiProperty({ example: 250 })
  @IsInt()
  weight: number;

  @ApiProperty({ example: 149.9 })
  @IsNumber()
  price: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  stock?: number;
}

export class SaveVariantsDto {
  @ApiProperty({ type: [VariantInputDto] })
  @IsArray()
  variants: VariantInputDto[];
}
