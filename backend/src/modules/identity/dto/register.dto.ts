import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsBoolean,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsStrongPassword } from '../../../common/validators/password.validator';

export class RegisterDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail({}, { message: 'Geçerli bir email adresi girin' })
  email: string;

  @ApiProperty({
    example: 'SecurePass123!',
    description: 'En az 8 karakter, 1 büyük harf, 1 küçük harf, 1 rakam ve 1 özel karakter içermeli',
  })
  @IsString()
  @MinLength(8, { message: 'Şifre en az 8 karakter olmalı' })
  @MaxLength(128, { message: 'Şifre en fazla 128 karakter olabilir' })
  @IsStrongPassword()
  password: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  lastName: string;

  @ApiPropertyOptional({ example: '+905551234567' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  privacyAccepted: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  marketingConsent?: boolean;
}
