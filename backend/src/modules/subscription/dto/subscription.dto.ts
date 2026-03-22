import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsIn, MaxLength } from 'class-validator';
import { GrindType, PaymentMethod } from '@prisma/client';

export class SubscribeDto {
  @ApiProperty({ example: 'plan-id-here' })
  @IsString()
  planId: string;

  @ApiPropertyOptional({ enum: GrindType })
  @IsOptional()
  @IsEnum(GrindType)
  grindPreference?: GrindType;

  @ApiProperty({ enum: ['CREDIT_CARD', 'DEBIT_CARD'], example: 'CREDIT_CARD' })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;
}

export class ChangePlanDto {
  @ApiProperty({ example: 'new-plan-id' })
  @IsString()
  newPlanId: string;

  @ApiPropertyOptional({ description: 'immediate veya end_of_period', example: 'end_of_period' })
  @IsOptional()
  @IsIn(['immediate', 'end_of_period'])
  timing?: 'immediate' | 'end_of_period';
}

export class UpdatePaymentMethodDto {
  @ApiProperty({ description: 'Payment token from provider' })
  @IsString()
  paymentToken: string;

  @ApiProperty({ example: '4242' })
  @IsString()
  @MaxLength(4)
  cardLast4: string;

  @ApiProperty({ example: 'Visa' })
  @IsString()
  @MaxLength(20)
  cardBrand: string;

  @ApiPropertyOptional({ example: 'paytr' })
  @IsOptional()
  @IsIn(['paytr', 'iyzico'])
  provider?: 'paytr' | 'iyzico';
}

export class UpdateGrindDto {
  @ApiProperty({ enum: GrindType })
  @IsEnum(GrindType)
  grindPreference: GrindType;
}
