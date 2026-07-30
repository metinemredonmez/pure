import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsOptional, IsEnum, MaxLength, IsArray, ValidateNested, IsInt, Min, ArrayMinSize, IsEmail } from 'class-validator';
import { OrderStatus, PaymentMethod } from '@prisma/client';

export class CreateOrderItemDto {
  @ApiProperty({ example: 'product-id-123' })
  @IsString()
  productId: string;

  @ApiPropertyOptional({ example: 'variant-id-456' })
  @IsOptional()
  @IsString()
  variantId?: string;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;
}

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

  @ApiPropertyOptional({ type: [CreateOrderItemDto], description: 'Checkout items from client cart. If omitted, server cart is used.' })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items?: CreateOrderItemDto[];
}

/**
 * Üyeliksiz (misafir) sipariş — tek public çağrıda müşteri + adres + sipariş +
 * PayTR oturumu oluşturulur. Backend e-postadan misafir müşteriyi bul/oluşturur.
 */
export class CreateGuestOrderDto {
  @ApiProperty({ example: 'musteri@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Ahmet' })
  @IsString()
  @MaxLength(100)
  firstName: string;

  @ApiProperty({ example: 'Yılmaz' })
  @IsString()
  @MaxLength(100)
  lastName: string;

  @ApiProperty({ example: '05001234567' })
  @IsString()
  @MaxLength(30)
  phone: string;

  @ApiProperty({ example: 'Atatürk Mah. 123 Sk. No:4' })
  @IsString()
  @MaxLength(300)
  line1: string;

  @ApiPropertyOptional({ example: 'Daire 5' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  line2?: string;

  @ApiProperty({ example: 'İstanbul' })
  @IsString()
  @MaxLength(100)
  city: string;

  @ApiProperty({ example: 'Kadıköy' })
  @IsString()
  @MaxLength(100)
  district: string;

  @ApiPropertyOptional({ example: '34000' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  postalCode?: string;

  @ApiPropertyOptional({ example: 'SUMMER20' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  couponCode?: string;

  @ApiPropertyOptional({ example: 'Kapıyı iki kez çalın' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;

  @ApiPropertyOptional({ enum: PaymentMethod, default: PaymentMethod.CREDIT_CARD })
  @IsOptional()
  @IsEnum(PaymentMethod)
  method?: PaymentMethod;

  @ApiProperty({ type: [CreateOrderItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
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
