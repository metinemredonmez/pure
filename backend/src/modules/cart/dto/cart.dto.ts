import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, Min } from 'class-validator';

export class AddCartItemDto {
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

export class UpdateCartItemDto {
  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(0)
  quantity: number;
}

export class MergeCartsDto {
  @ApiProperty({ example: 'guest-session-id-123' })
  @IsString()
  sessionId: string;
}
