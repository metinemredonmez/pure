import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  MaxLength,
  MinLength,
  IsDateString,
} from 'class-validator';

// ══════════════════════════════════════════════
// ADDRESS DTOs
// ══════════════════════════════════════════════

export class CreateAddressDto {
  @ApiProperty({ example: 'Ev' })
  @IsString()
  @MaxLength(50)
  title: string;

  @ApiProperty({ example: 'Ahmet' })
  @IsString()
  @MaxLength(100)
  firstName: string;

  @ApiProperty({ example: 'Yılmaz' })
  @IsString()
  @MaxLength(100)
  lastName: string;

  @ApiProperty({ example: '+905551234567' })
  @IsString()
  @MaxLength(20)
  phone: string;

  @ApiProperty({ example: 'Atatürk Caddesi No: 123' })
  @IsString()
  @MaxLength(255)
  line1: string;

  @ApiPropertyOptional({ example: 'Daire 5' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  line2?: string;

  @ApiProperty({ example: 'İstanbul' })
  @IsString()
  @MaxLength(100)
  city: string;

  @ApiProperty({ example: 'Kadıköy' })
  @IsString()
  @MaxLength(100)
  district: string;

  @ApiProperty({ example: '34000' })
  @IsString()
  @MaxLength(20)
  postalCode: string;

  @ApiPropertyOptional({ example: 'TR', default: 'TR' })
  @IsOptional()
  @IsString()
  @MaxLength(2)
  country?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdateAddressDto {
  @ApiPropertyOptional({ example: 'Ev' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  title?: string;

  @ApiPropertyOptional({ example: 'Ahmet' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @ApiPropertyOptional({ example: 'Yılmaz' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @ApiPropertyOptional({ example: '+905551234567' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ example: 'Atatürk Caddesi No: 123' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  line1?: string;

  @ApiPropertyOptional({ example: 'Daire 5' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  line2?: string;

  @ApiPropertyOptional({ example: 'İstanbul' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({ example: 'Kadıköy' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  district?: string;

  @ApiPropertyOptional({ example: '34000' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  postalCode?: string;

  @ApiPropertyOptional({ example: 'TR' })
  @IsOptional()
  @IsString()
  @MaxLength(2)
  country?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

// ══════════════════════════════════════════════
// PROFILE DTOs
// ══════════════════════════════════════════════

// ══════════════════════════════════════════════
// ADMIN USER DTOs
// ══════════════════════════════════════════════

export class AdminUserQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @IsNumber()
  limit?: number;

  @ApiPropertyOptional({ example: 'ahmet@example.com' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 'CUSTOMER' })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 'createdAt' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ example: 'desc' })
  @IsOptional()
  @IsString()
  sortOrder?: string;
}

export class AdminUpdateRoleDto {
  @ApiProperty({ example: 'ADMIN', enum: ['CUSTOMER', 'ADMIN', 'SALES', 'SUPPORT', 'PARTNER'] })
  @IsString()
  role: string;
}

export class AdminBanUserDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  banned: boolean;

  @ApiPropertyOptional({ example: 'Spam hesabı' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

// ══════════════════════════════════════════════
// PROFILE DTOs
// ══════════════════════════════════════════════

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Ahmet' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  firstName?: string;

  @ApiPropertyOptional({ example: 'Yılmaz' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  lastName?: string;

  @ApiPropertyOptional({ example: '+905551234567' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ example: 'Feyzullah Mah. Ulusu Apt. No:9-4 Maltepe' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional({ example: '1990-05-15' })
  @IsOptional()
  @IsDateString()
  birthday?: string;

  @ApiPropertyOptional({ example: 41.0082 })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ example: 28.9784 })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({ example: 'Ev' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  locationLabel?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  marketingConsent?: boolean;
}
