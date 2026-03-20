import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, MaxLength } from 'class-validator';
import { OrderStatus } from '@prisma/client';

export class CreateOrderDto {
  @ApiProperty({ example: 'address-id-123' })
  @IsString()
  addressId: string;

  @ApiPropertyOptional({ example: 'SUMMER20' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  couponCode?: string;

  @ApiPropertyOptional({ example: 'Please ring the doorbell twice' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: OrderStatus })
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @ApiPropertyOptional({ example: 'Shipped via Yurtiçi Kargo' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
