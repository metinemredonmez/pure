import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({ example: 'Merhaba, kahve önerir misin?' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  message: string;
}
