import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsBoolean,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ShippingCarrier } from '@prisma/client';

export class CreateShipmentDto {
  @ApiProperty({ example: 'clx123456789' })
  @IsString()
  orderId: string;

  @ApiProperty({ enum: ShippingCarrier, default: ShippingCarrier.YURTICI })
  @IsEnum(ShippingCarrier)
  carrier: ShippingCarrier;
}

export class CalculateShippingDto {
  @ApiProperty({ example: 2.5, description: 'Ağırlık (kg)' })
  @IsNumber()
  @Min(0.1)
  weight: number;

  @ApiProperty({ example: 'İstanbul' })
  @IsString()
  city: string;

  @ApiPropertyOptional({ enum: ShippingCarrier })
  @IsOptional()
  @IsEnum(ShippingCarrier)
  carrier?: ShippingCarrier;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isExpress?: boolean;

  @ApiPropertyOptional({ example: 450, description: 'Sepet tutarı (TL)' })
  @IsOptional()
  @IsNumber()
  cartTotal?: number;
}

export class UpdateShippingSettingsDto {
  @ApiPropertyOptional({ enum: ShippingCarrier })
  @IsOptional()
  @IsEnum(ShippingCarrier)
  defaultCarrier?: ShippingCarrier;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  freeShippingEnabled?: boolean;

  @ApiPropertyOptional({ example: 500 })
  @IsOptional()
  @IsNumber()
  freeShippingThreshold?: number;

  @ApiPropertyOptional({ example: 25 })
  @IsOptional()
  @IsNumber()
  expressDeliveryFee?: number;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @IsNumber()
  maxWeight?: number;
}

export class WebhookDto {
  @ApiProperty()
  @IsString()
  trackingNumber: string;

  @ApiProperty()
  @IsString()
  status: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  timestamp?: string;
}
