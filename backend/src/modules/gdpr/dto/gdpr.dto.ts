import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateConsentDto {
  @ApiProperty({ example: 'marketing_email' })
  @IsString()
  @MaxLength(100)
  consentType: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  accepted: boolean;

  @ApiProperty({ example: '1.0' })
  @IsString()
  @MaxLength(20)
  version: string;
}

export class CookiePreferencesDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  necessary: boolean;

  @ApiProperty({ example: false })
  @IsBoolean()
  analytics: boolean;

  @ApiProperty({ example: false })
  @IsBoolean()
  marketing: boolean;

  @ApiProperty({ example: false })
  @IsBoolean()
  preferences: boolean;
}

export class UpdateCookieConsentDto {
  @ApiPropertyOptional({ example: 'user@example.com' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  email?: string;

  @ApiProperty()
  @ValidateNested()
  @Type(() => CookiePreferencesDto)
  preferences: CookiePreferencesDto;
}

