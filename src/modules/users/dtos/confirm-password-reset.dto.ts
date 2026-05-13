import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

import { IsStrongPassword } from '@/common/validators/is-strong-password.validator';

export class ConfirmPasswordResetDto {
  @ApiProperty({ format: 'email' })
  @IsEmail()
  @MaxLength(320)
  email!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(512)
  token!: string;

  @ApiProperty({ description: 'Nova senha (≥8 chars, letras + números).' })
  @IsStrongPassword()
  newPassword!: string;
}
