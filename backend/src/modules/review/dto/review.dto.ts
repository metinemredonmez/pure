import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  IsOptional,
  IsBoolean,
  IsArray,
  Min,
  Max,
  MaxLength,
} from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({ example: 'Harika kahve!' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({ example: 'Çok lezzetli, kesinlikle tavsiye ederim.' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  comment?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  orderId?: string;
}

export class UpdateReviewDto {
  @ApiPropertyOptional({ example: 4, minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  comment?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}

export class AdminApproveReviewDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  approve: boolean;

  @ApiPropertyOptional({ example: 'İçerik uygun' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  adminNote?: string;
}
