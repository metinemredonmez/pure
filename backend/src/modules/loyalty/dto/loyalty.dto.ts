import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, Min } from 'class-validator';

export class ActivateLoyaltyDto {
  @ApiPropertyOptional({ example: 'REF123ABC' })
  @IsOptional()
  @IsString()
  referralCode?: string;
}

export class RedeemPointsDto {
  @ApiProperty({ example: 100, description: 'Points to redeem (min 100)' })
  @IsInt()
  @Min(100)
  points: number;
}

export class AdminAdjustPointsDto {
  @ApiProperty({ example: 'user-uuid-123' })
  @IsString()
  userId: string;

  @ApiProperty({
    example: 50,
    description: 'Points to add (negative to subtract)',
  })
  @IsInt()
  points: number;

  @ApiProperty({ example: 'Compensation for delayed order' })
  @IsString()
  reason: string;
}

export class UpdateLoyaltyConfigDto {
  @ApiProperty({ example: 'points_per_tl' })
  @IsString()
  key: string;

  @ApiProperty({ example: '10' })
  @IsString()
  value: string;

  @ApiPropertyOptional({ example: 'Points earned per 1 TL spent' })
  @IsOptional()
  @IsString()
  description?: string;
}
