import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IntegrationGroup } from '@prisma/client';

export class UpdateSettingValueDto {
  @ApiPropertyOptional({ example: '123456', nullable: true })
  @IsOptional()
  @IsString()
  value?: string | null;
}

export class UpdateSettingDto {
  @ApiProperty({ example: 'paytr_merchant_id' })
  @IsString()
  key: string;

  @ApiPropertyOptional({ example: '123456', nullable: true })
  @IsOptional()
  @IsString()
  value?: string | null;
}

export class BulkUpdateSettingsDto {
  @ApiProperty({ type: [UpdateSettingDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateSettingDto)
  settings: UpdateSettingDto[];
}

export class TestConnectionDto {
  @ApiProperty({ enum: IntegrationGroup })
  @IsEnum(IntegrationGroup)
  group: IntegrationGroup;
}

export class SettingResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  key: string;

  @ApiProperty({ enum: IntegrationGroup })
  group: IntegrationGroup;

  @ApiProperty()
  label: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  valueType: string;

  @ApiPropertyOptional({ type: [String] })
  enumOptions?: string[];

  @ApiProperty()
  isEncrypted: boolean;

  @ApiProperty()
  isRequired: boolean;

  @ApiProperty()
  sortOrder: number;

  @ApiProperty()
  hasValue: boolean;

  @ApiPropertyOptional()
  value?: string | null;

  @ApiProperty()
  updatedAt: Date;
}

export class SettingsListResponseDto {
  @ApiProperty({ type: [SettingResponseDto] })
  settings: SettingResponseDto[];

  @ApiProperty()
  total: number;
}

export class GroupSummaryDto {
  @ApiProperty({ enum: IntegrationGroup })
  group: IntegrationGroup;

  @ApiProperty()
  label: string;

  @ApiProperty()
  totalSettings: number;

  @ApiProperty()
  configuredSettings: number;

  @ApiProperty()
  encryptedSettings: number;
}
