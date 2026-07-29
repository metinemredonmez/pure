import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  IsArray,
  IsDateString,
  IsUrl,
  Min,
  Allow,
} from 'class-validator';
import { Type } from 'class-transformer';

// ── Hero Banner ──

export class CreateBannerDto {
  @ApiProperty() @IsString() title: string;
  @ApiPropertyOptional() @IsOptional() @IsString() subtitle?: string;
  @ApiProperty() @IsString() image: string;
  @ApiPropertyOptional() @IsOptional() @IsString() mobileImage?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() ctaText?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() ctaUrl?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(0) sortOrder?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsDateString() startDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() endDate?: string;
}

export class UpdateBannerDto {
  @ApiPropertyOptional() @IsOptional() @IsString() title?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() subtitle?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() image?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() mobileImage?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() ctaText?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() ctaUrl?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(0) sortOrder?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsDateString() startDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() endDate?: string;
}

export class ReorderDto {
  @ApiProperty({ type: [Object] })
  @IsArray()
  items: { id: string; sortOrder: number }[];
}

// ── Machine ──

export class CreateMachineDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty() @IsString() slug: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsArray() @IsString({ each: true }) images?: string[];
  @ApiPropertyOptional() @IsOptional() @IsString() capacity?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() dailyCupMin?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() dailyCupMax?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() drinkCount?: number;
  @ApiPropertyOptional() @IsOptional() @IsArray() @IsString({ each: true }) features?: string[];
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(0) sortOrder?: number;
}

export class UpdateMachineDto {
  @ApiPropertyOptional() @IsOptional() @IsString() name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() slug?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsArray() @IsString({ each: true }) images?: string[];
  @ApiPropertyOptional() @IsOptional() @IsString() capacity?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() dailyCupMin?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() dailyCupMax?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() drinkCount?: number;
  @ApiPropertyOptional() @IsOptional() @IsArray() @IsString({ each: true }) features?: string[];
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(0) sortOrder?: number;
}

export class CreateMachineModuleDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty() @Type(() => Number) @IsInt() width: number;
  @ApiProperty() @Type(() => Number) @IsInt() height: number;
  @ApiProperty() @Type(() => Number) @IsInt() depth: number;
  @ApiPropertyOptional() @IsOptional() @IsString() variant?: string;
}

// ── Brand DTO'ları kaldırıldı (orphan model temizliği) ──

// ── Reference ──

export class CreateReferenceDto {
  @ApiProperty() @IsString() companyName: string;
  @ApiPropertyOptional() @IsOptional() @IsString() logo?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() testimonial?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() contactPerson?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() sector?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(0) sortOrder?: number;
}

export class UpdateReferenceDto {
  @ApiPropertyOptional() @IsOptional() @IsString() companyName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() logo?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() testimonial?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() contactPerson?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() sector?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(0) sortOrder?: number;
}

// ── Page ──

export class CreatePageDto {
  @ApiProperty() @IsString() title: string;
  @ApiProperty() @IsString() slug: string;
  @ApiPropertyOptional() @IsOptional() sections?: any;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isPublished?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() heroImage?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() heroKicker?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() seoTitle?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() seoDescription?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() seoImage?: string;
}

export class UpdatePageDto {
  @ApiPropertyOptional() @IsOptional() @IsString() title?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() slug?: string;
  @ApiPropertyOptional() @IsOptional() sections?: any;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isPublished?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() heroImage?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() heroKicker?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() seoTitle?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() seoDescription?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() seoImage?: string;
}

// ── Site Settings ──

export class UpdateSiteSettingsDto {
  @ApiProperty() @IsString() key: string;
  @ApiProperty() @Allow() value: any;
}

// ── Franchise Application ──

export class CreateFranchiseApplicationDto {
  @ApiProperty({ example: 'Ahmet Yilmaz' }) @IsString() fullName: string;
  @ApiProperty({ example: '05551234567' }) @IsString() phone: string;
  @ApiProperty({ example: 'ahmet@email.com' }) @IsString() email: string;
  @ApiProperty({ example: 'Istanbul / Kadikoy' }) @IsString() city: string;
  @ApiProperty({ example: 'cadde', enum: ['cadde', 'avm', 'ofis', 'diger'] }) @IsString() locationType: string;
  @ApiPropertyOptional() @IsOptional() @IsString() locationTypeOther?: string;
  @ApiProperty({ example: '500000-1000000', enum: ['500000-alti', '500000-1000000', '1000000-2000000', '2000000-uzeri'] }) @IsString() budget: string;
  @ApiProperty() @IsBoolean() hasExperience: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() experienceDetail?: string;
  @ApiProperty({ example: 'hemen', enum: ['hemen', '1-3-ay', '3-6-ay', '6-ay-sonrasi'] }) @IsString() plannedOpenDate: string;
  @ApiPropertyOptional() @IsOptional() @IsString() heardFrom?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}

export class UpdateFranchiseStatusDto {
  @ApiProperty({ enum: ['NEW', 'REVIEWING', 'CONTACTED', 'INTERVIEW', 'APPROVED', 'REJECTED'] }) @IsString() status: string;
  @ApiPropertyOptional() @IsOptional() @IsString() adminNotes?: string;
}

// ── Contact Message ──

export class CreateContactMessageDto {
  @ApiProperty({ example: 'Ahmet Yilmaz' }) @IsString() name: string;
  @ApiProperty({ example: 'ahmet@email.com' }) @IsString() email: string;
  @ApiProperty({ example: 'Toplu sipariş hakkında bilgi almak istiyorum.' }) @IsString() message: string;
  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() subject?: string;
}

export class SubscribeNewsletterDto {
  @ApiProperty({ example: 'ahmet@email.com' }) @IsString() email: string;
  @ApiPropertyOptional() @IsOptional() @IsString() name?: string;
  @ApiPropertyOptional({ description: 'web-footer | admin-manual | checkout' }) @IsOptional() @IsString() source?: string;
}
