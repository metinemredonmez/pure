import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsObject, MaxLength } from 'class-validator';

// ══════════════════════════════════════════════
// NOTIFICATION TEMPLATE DTOs
// ══════════════════════════════════════════════

export class SendEmailDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsString()
  to: string;

  @ApiProperty({ example: 'Sipariş Bildirimi' })
  @IsString()
  @MaxLength(255)
  subject: string;

  @ApiProperty({ example: '<h1>Merhaba</h1>' })
  @IsString()
  html: string;
}

export class SendTemplatedEmailDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsString()
  to: string;

  @ApiProperty({ example: 'order_confirmed' })
  @IsString()
  template: string;

  @ApiProperty({ example: { firstName: 'Emre', orderNumber: 'ORD-001' } })
  @IsObject()
  variables: Record<string, string>;
}

export class SendInAppDto {
  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty()
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiProperty()
  @IsString()
  @MaxLength(1000)
  message: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  link?: string;
}

export class CreateTemplateDto {
  @ApiProperty({ example: 'order_confirmation' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'email' })
  @IsString()
  @MaxLength(20)
  channel: string;

  @ApiPropertyOptional({ example: 'Siparişiniz Onaylandı' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  subject?: string;

  @ApiProperty()
  @IsString()
  body: string;
}

export class UpdateTemplateDto {
  @ApiPropertyOptional({ example: 'order_confirmation' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    example: 'email',
    description: 'Channel: email, push',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  channel?: string;

  @ApiPropertyOptional({ example: 'Siparişiniz Onaylandı' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  subject?: string;

  @ApiPropertyOptional({
    example: 'Merhaba {{firstName}}, siparişiniz onaylandı...',
  })
  @IsOptional()
  @IsString()
  body?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
