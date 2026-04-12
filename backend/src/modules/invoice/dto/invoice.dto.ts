import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
  IsEmail,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

// ══════════════════════════════════════════════
// INVOICE TYPE ENUM
// ══════════════════════════════════════════════

export enum InvoiceType {
  /** e-Fatura (registered taxpayer) */
  E_FATURA = 'E_FATURA',
  /** e-Arsiv (non-registered or individual) */
  E_ARSIV = 'E_ARSIV',
}

// ══════════════════════════════════════════════
// INVOICE LINE ITEM
// ══════════════════════════════════════════════

export class InvoiceLineItemDto {
  @ApiProperty({ example: 'Ethiopia Sidamo 250g' })
  @IsString()
  name: string;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: 'adet', description: 'Unit type (adet, kg, lt, etc.)' })
  @IsString()
  unit: string;

  @ApiProperty({ example: 89.9, description: 'Unit price (KDV haric)' })
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiProperty({ example: 10, description: 'KDV rate (percent)' })
  @IsNumber()
  vatRate: number;

  @ApiPropertyOptional({ example: 0, description: 'Discount amount' })
  @IsOptional()
  @IsNumber()
  discount?: number;
}

// ══════════════════════════════════════════════
// CREATE INVOICE
// ══════════════════════════════════════════════

export class CreateInvoiceDto {
  @ApiProperty({ enum: InvoiceType, default: InvoiceType.E_ARSIV })
  @IsEnum(InvoiceType)
  type: InvoiceType;

  @ApiProperty({ example: 'Ali Yilmaz', description: 'Buyer name or company' })
  @IsString()
  buyerName: string;

  @ApiPropertyOptional({ example: '1234567890', description: 'TC kimlik no (bireysel)' })
  @IsOptional()
  @IsString()
  buyerTcNo?: string;

  @ApiPropertyOptional({ example: '1234567890', description: 'Vergi no (kurumsal)' })
  @IsOptional()
  @IsString()
  buyerTaxNo?: string;

  @ApiPropertyOptional({ example: 'Kadikoy VD', description: 'Vergi dairesi' })
  @IsOptional()
  @IsString()
  buyerTaxOffice?: string;

  @ApiPropertyOptional({ example: 'ali@example.com' })
  @IsOptional()
  @IsEmail()
  buyerEmail?: string;

  @ApiPropertyOptional({ example: 'Ataturk Cad. No:1, Kadikoy, Istanbul' })
  @IsOptional()
  @IsString()
  buyerAddress?: string;

  @ApiProperty({ type: [InvoiceLineItemDto], description: 'Invoice line items' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceLineItemDto)
  items: InvoiceLineItemDto[];

  @ApiPropertyOptional({ example: 'ORD-20260412-001', description: 'Order reference number' })
  @IsOptional()
  @IsString()
  orderRef?: string;

  @ApiPropertyOptional({ example: 'Kahve siparisi' })
  @IsOptional()
  @IsString()
  note?: string;
}

// ══════════════════════════════════════════════
// LIST INVOICES QUERY
// ══════════════════════════════════════════════

export class ListInvoicesQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number;

  @ApiPropertyOptional({ example: '2026-04-01', description: 'Start date (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-04-30', description: 'End date (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  endDate?: string;
}
