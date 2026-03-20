import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsInt,
  IsDateString,
  MaxLength,
  Min,
  IsEnum,
} from 'class-validator';

// ══════════════════════════════════════════════
// VALIDATE COUPON DTO
// ══════════════════════════════════════════════

export class ValidateCouponDto {
  @ApiProperty({ example: 'SUMMER20' })
  @IsString()
  @MaxLength(50)
  code: string;

  @ApiProperty({ example: 250, description: 'Cart subtotal' })
  @IsNumber()
  @Min(0)
  subtotal: number;
}

// ══════════════════════════════════════════════
// COUPON DTOs
// ══════════════════════════════════════════════

export class CreateCouponDto {
  @ApiProperty({ example: 'SUMMER20' })
  @IsString()
  @MaxLength(50)
  code: string;

  @ApiPropertyOptional({ example: 'Yaz indirimi' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @ApiProperty({
    example: 'percentage',
    description: 'Type: percentage, fixed, free_shipping',
  })
  @IsString()
  @IsEnum(['percentage', 'fixed', 'free_shipping'])
  type: string;

  @ApiProperty({
    example: 20,
    description: 'Discount value (percentage or fixed amount)',
  })
  @IsNumber()
  @Min(0)
  value: number;

  @ApiPropertyOptional({ example: 100, description: 'Minimum order amount' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minOrderAmount?: number;

  @ApiPropertyOptional({
    example: 50,
    description: 'Maximum discount amount for percentage',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDiscount?: number;

  @ApiPropertyOptional({ example: 100, description: 'Maximum number of uses' })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxUses?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: '2024-06-01T00:00:00Z' })
  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @ApiPropertyOptional({ example: '2024-08-31T23:59:59Z' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

export class UpdateCouponDto {
  @ApiPropertyOptional({ example: 'SUMMER20' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  code?: string;

  @ApiPropertyOptional({ example: 'Yaz indirimi' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @ApiPropertyOptional({
    example: 'percentage',
    description: 'Type: percentage, fixed, free_shipping',
  })
  @IsOptional()
  @IsString()
  @IsEnum(['percentage', 'fixed', 'free_shipping'])
  type?: string;

  @ApiPropertyOptional({
    example: 20,
    description: 'Discount value (percentage or fixed amount)',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  value?: number;

  @ApiPropertyOptional({ example: 100, description: 'Minimum order amount' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minOrderAmount?: number;

  @ApiPropertyOptional({
    example: 50,
    description: 'Maximum discount amount for percentage',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDiscount?: number;

  @ApiPropertyOptional({ example: 100, description: 'Maximum number of uses' })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxUses?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: '2024-06-01T00:00:00Z' })
  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @ApiPropertyOptional({ example: '2024-08-31T23:59:59Z' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
