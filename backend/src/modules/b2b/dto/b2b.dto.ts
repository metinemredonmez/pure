import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsOptional,
  IsNumber,
  IsInt,
  IsDateString,
  IsEnum,
  MaxLength,
  Min,
} from 'class-validator';
import { LeadStatus } from '@prisma/client';

// ══════════════════════════════════════════════
// LEAD DTOs
// ══════════════════════════════════════════════

export class CreateLeadDto {
  @ApiProperty({ example: 'Acme Corp' })
  @IsString()
  @MaxLength(255)
  companyName: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @MaxLength(255)
  contactName: string;

  @ApiProperty({ example: 'john@acme.com' })
  @IsEmail({}, { message: 'Geçerli bir email adresi girin' })
  email: string;

  @ApiProperty({ example: '+905551234567' })
  @IsString()
  @MaxLength(20)
  phone: string;

  @ApiPropertyOptional({ example: 50, description: 'Number of employees' })
  @IsOptional()
  @IsInt()
  @Min(1)
  employeeCount?: number;

  @ApiPropertyOptional({
    example: '10-25kg',
    description: 'Monthly coffee consumption',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  monthlyConsumption?: string;

  @ApiPropertyOptional({
    example: 'Otel sektörü, espresso bar açıyoruz...',
    description: 'Free-form notes from public form (sector + message birleşik)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}

export class UpdateLeadDto {
  @ApiProperty({ enum: LeadStatus })
  @IsEnum(LeadStatus)
  status: LeadStatus;

  @ApiPropertyOptional({
    example: 'user-id-123',
    description: 'Assigned sales rep ID',
  })
  @IsOptional()
  @IsString()
  assignedTo?: string;

  @ApiPropertyOptional({ example: 'Called on Monday, will follow up' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}

// ══════════════════════════════════════════════
// QUOTE DTOs
// ══════════════════════════════════════════════

export class CreateQuoteDto {
  @ApiProperty({ example: 'lead-id-123' })
  @IsString()
  leadId: string;

  @ApiProperty({ example: 'Premium Office Package' })
  @IsString()
  @MaxLength(255)
  packageName: string;

  @ApiProperty({ example: 25, description: 'Monthly coffee kg' })
  @IsNumber()
  @Min(1)
  monthlyKg: number;

  @ApiProperty({ example: 2, description: 'Number of machines' })
  @IsInt()
  @Min(1)
  machineCount: number;

  @ApiProperty({ example: 12, description: 'Contract duration in months' })
  @IsInt()
  @Min(1)
  contractMonths: number;

  @ApiProperty({ example: 5000, description: 'Monthly price in TL' })
  @IsNumber()
  @Min(0)
  monthlyPrice: number;

  @ApiPropertyOptional({ example: 1500, description: 'One-time setup fee' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  setupFee?: number;
}

// ══════════════════════════════════════════════
// CONTRACT DTOs
// ══════════════════════════════════════════════

export class CreateContractDto {
  @ApiProperty({ example: 'lead-id-123' })
  @IsString()
  leadId: string;

  @ApiProperty({ example: '2024-01-01' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2025-01-01' })
  @IsDateString()
  endDate: string;

  @ApiProperty({ example: 25, description: 'Monthly coffee kg' })
  @IsNumber()
  @Min(1)
  monthlyKg: number;

  @ApiProperty({ example: 5000, description: 'Monthly price in TL' })
  @IsNumber()
  @Min(0)
  monthlyPrice: number;
}

export class AssignMachineDto {
  @ApiProperty({ example: 'Jura E8' })
  @IsString()
  @MaxLength(255)
  machineModel: string;

  @ApiPropertyOptional({ example: 'SN-2024-001' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  serialNumber?: string;

  @ApiPropertyOptional({ example: '3rd Floor Kitchen' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;
}
