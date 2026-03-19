import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EnableMfaDto {
  @ApiProperty({ description: 'TOTP code from authenticator app' })
  @IsString()
  code: string;
}

export class VerifyMfaDto {
  @ApiProperty({ description: 'TOTP code from authenticator app' })
  @IsString()
  code: string;
}
