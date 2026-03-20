import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsEnum,
  Min,
  Max,
} from 'class-validator';
import { PriceChannel } from '@prisma/client';

// ══════════════════════════════════════════════
// VOLUME DISCOUNT DTOs
// ══════════════════════════════════════════════

export class CreateVolumeDiscountDto {
  @ApiProperty({ example: '5kg %10 İndirim' })
  @IsString()
  name: string;

  @ApiProperty({ enum: PriceChannel, example: 'B2C' })
  @IsEnum(PriceChannel)
  channel: PriceChannel;

  @ApiProperty({ example: 5000, description: 'Minimum quantity in grams' })
  @IsNumber()
  @Min(1)
  minQuantity: number;

  @ApiPropertyOptional({
    example: 10000,
    description: 'Maximum quantity in grams',
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxQuantity?: number;

  @ApiProperty({ example: 10.0, description: 'Discount percentage' })
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercent: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class SetProductPriceDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  variantId?: string;

  @ApiProperty({ enum: PriceChannel })
  @IsEnum(PriceChannel)
  channel: PriceChannel;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  minQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  startsAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  endsAt?: string;
}

export class SetCustomerPriceDto {
  @ApiProperty()
  @IsString()
  productId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  variantId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contractId?: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  minQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  startsAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  endsAt?: string;
}

export class UpdateVolumeDiscountDto {
  @ApiPropertyOptional({ example: '5kg %10 İndirim' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ enum: PriceChannel, example: 'B2C' })
  @IsOptional()
  @IsEnum(PriceChannel)
  channel?: PriceChannel;

  @ApiPropertyOptional({
    example: 5000,
    description: 'Minimum quantity in grams',
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  minQuantity?: number;

  @ApiPropertyOptional({
    example: 10000,
    description: 'Maximum quantity in grams',
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxQuantity?: number;

  @ApiPropertyOptional({ example: 10.0, description: 'Discount percentage' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercent?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
