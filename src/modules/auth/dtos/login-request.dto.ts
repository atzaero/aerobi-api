import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

import { NormalizeEmail } from '@/common/validators/transformers';

export class LoginRequestDto {
  @ApiProperty({ example: 'admin@aerobi.local', format: 'email' })
  @NormalizeEmail()
  @IsEmail()
  @MaxLength(320)
  email!: string;

  @ApiProperty({ example: 'SenhaForte123!' })
  @IsString()
  @MinLength(1)
  @MaxLength(256)
  password!: string;
}
