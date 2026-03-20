import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsEnum, Min } from 'class-validator';
import { PaymentMethod } from '@prisma/client';

// ══════════════════════════════════════════════
// PAYMENT INIT DTOs
// ══════════════════════════════════════════════

export class InitPaymentDto {
  @ApiProperty({ example: 'order-uuid-123' })
  @IsString()
  orderId: string;

  @ApiProperty({ enum: PaymentMethod, example: 'CREDIT_CARD' })
  @IsEnum(PaymentMethod)
  method: PaymentMethod;
}

export class InitApplePayDto {
  @ApiProperty({ example: 'order-uuid-123' })
  @IsString()
  orderId: string;
}

export class InitGooglePayDto {
  @ApiProperty({ example: 'order-uuid-123' })
  @IsString()
  orderId: string;
}

export class RefundPaymentDto {
  @ApiProperty({ example: 100.5, description: 'Refund amount' })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiPropertyOptional({ example: 'Customer requested refund' })
  @IsOptional()
  @IsString()
  reason?: string;
}

// ══════════════════════════════════════════════
// PAYTR WEBHOOK DTO
// ══════════════════════════════════════════════

export class PayTRWebhookDto {
  @ApiProperty({ example: 'SP123456789' })
  @IsString()
  merchant_oid: string;

  @ApiProperty({ example: 'success' })
  @IsString()
  status: string;

  @ApiProperty({ example: '10000' })
  @IsString()
  total_amount: string;

  @ApiProperty({ example: 'abc123hash' })
  @IsString()
  hash: string;

  @ApiPropertyOptional({ example: '01' })
  @IsOptional()
  @IsString()
  failed_reason_code?: string;

  @ApiPropertyOptional({ example: 'Insufficient funds' })
  @IsOptional()
  @IsString()
  failed_reason_msg?: string;

  @ApiPropertyOptional({ example: '0' })
  @IsOptional()
  @IsString()
  test_mode?: string;

  @ApiPropertyOptional({ example: 'card' })
  @IsOptional()
  @IsString()
  payment_type?: string;

  @ApiPropertyOptional({ example: 'TRY' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ example: '10000' })
  @IsOptional()
  @IsString()
  payment_amount?: string;
}

// ══════════════════════════════════════════════
// IYZICO WEBHOOK DTO
// ══════════════════════════════════════════════

export class IyzicoWebhookDto {
  @ApiProperty({ example: 'token123' })
  @IsString()
  token: string;

  @ApiProperty({ example: 'conversation123' })
  @IsString()
  conversationId: string;

  @ApiPropertyOptional({ example: 'SUCCESS' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: 'payment123' })
  @IsOptional()
  @IsString()
  paymentId?: string;
}
