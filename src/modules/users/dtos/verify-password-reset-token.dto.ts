import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

import { NormalizeEmail, TrimString } from '@/common/validators/transformers';

export class VerifyPasswordResetTokenDto {
  @ApiProperty({ format: 'email' })
  @NormalizeEmail()
  @IsEmail()
  @MaxLength(320)
  email!: string;

  @ApiProperty()
  @TrimString()
  @IsString()
  @MinLength(1)
  @MaxLength(512)
  token!: string;
}
