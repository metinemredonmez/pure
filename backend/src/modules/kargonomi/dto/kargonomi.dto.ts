import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsObject,
  ValidateNested,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

// ══════════════════════════════════════════════
// ADDRESS DTO (nested)
// ══════════════════════════════════════════════

export class KargonomiAddressDto {
  @ApiProperty({ example: 'Ali Yilmaz' })
  @IsString()
  name: string;

  @ApiProperty({ example: '05551234567' })
  @IsString()
  phone: string;

  @ApiProperty({ example: 'Ataturk Cad. No:1 D:5' })
  @IsString()
  address: string;

  @ApiProperty({ example: 34, description: 'State (il) ID' })
  @IsNumber()
  state_id: number;

  @ApiProperty({ example: 441, description: 'City (ilce) ID' })
  @IsNumber()
  city_id: number;

  @ApiPropertyOptional({ example: '34000' })
  @IsOptional()
  @IsString()
  zip_code?: string;
}

// ══════════════════════════════════════════════
// PARCEL DTO (nested)
// ══════════════════════════════════════════════

export class KargonomiParcelDto {
  @ApiProperty({ example: 1.5, description: 'Weight in kg' })
  @IsNumber()
  @Min(0.01)
  weight: number;

  @ApiPropertyOptional({ example: 30, description: 'Width in cm' })
  @IsOptional()
  @IsNumber()
  width?: number;

  @ApiPropertyOptional({ example: 20, description: 'Height in cm' })
  @IsOptional()
  @IsNumber()
  height?: number;

  @ApiPropertyOptional({ example: 15, description: 'Length in cm' })
  @IsOptional()
  @IsNumber()
  length?: number;
}

// ══════════════════════════════════════════════
// CREATE SHIPMENT
// ══════════════════════════════════════════════

export class CreateKargonomiShipmentDto {
  @ApiProperty({ type: KargonomiAddressDto })
  @ValidateNested()
  @Type(() => KargonomiAddressDto)
  sender: KargonomiAddressDto;

  @ApiProperty({ type: KargonomiAddressDto })
  @ValidateNested()
  @Type(() => KargonomiAddressDto)
  receiver: KargonomiAddressDto;

  @ApiProperty({ type: KargonomiParcelDto })
  @ValidateNested()
  @Type(() => KargonomiParcelDto)
  parcel: KargonomiParcelDto;

  @ApiPropertyOptional({ example: 'Kahve urunleri' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 150.0, description: 'COD amount (kapida odeme)' })
  @IsOptional()
  @IsNumber()
  cod_amount?: number;
}

// ══════════════════════════════════════════════
// UPDATE SHIPMENT
// ══════════════════════════════════════════════

export class UpdateKargonomiShipmentDto {
  @ApiPropertyOptional({ type: KargonomiAddressDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => KargonomiAddressDto)
  sender?: KargonomiAddressDto;

  @ApiPropertyOptional({ type: KargonomiAddressDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => KargonomiAddressDto)
  receiver?: KargonomiAddressDto;

  @ApiPropertyOptional({ type: KargonomiParcelDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => KargonomiParcelDto)
  parcel?: KargonomiParcelDto;

  @ApiPropertyOptional({ example: 'Kahve urunleri' })
  @IsOptional()
  @IsString()
  description?: string;
}

// ══════════════════════════════════════════════
// CONFIRM SHIPPING
// ══════════════════════════════════════════════

export class ConfirmShippingDto {
  @ApiProperty({ example: 123, description: 'Kargonomi shipment ID' })
  @IsNumber()
  shipment_id: number;

  @ApiProperty({ example: 456, description: 'Selected shipping provider/price ID' })
  @IsNumber()
  provider_id: number;
}

// ══════════════════════════════════════════════
// CANCEL SHIPMENT
// ══════════════════════════════════════════════

export class CancelKargonomiShipmentDto {
  @ApiProperty({ example: 123, description: 'Kargonomi shipment ID' })
  @IsNumber()
  shipment_id: number;
}

// ══════════════════════════════════════════════
// WEBHOOK PAYLOAD
// ══════════════════════════════════════════════

export class KargonomiWebhookDto {
  @ApiProperty({ description: 'Webhook event type' })
  @IsString()
  event: string;

  @ApiProperty({ description: 'Webhook payload data' })
  @IsObject()
  data: Record<string, any>;
}

// ══════════════════════════════════════════════
// QUERY DTOs
// ══════════════════════════════════════════════

export class ListShipmentsQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number;
}
