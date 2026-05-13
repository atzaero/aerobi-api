import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, MaxLength } from 'class-validator';

import { NormalizeEmail } from '@/common/validators/transformers';

export class RequestPasswordResetDto {
  @ApiProperty({ format: 'email' })
  @NormalizeEmail()
  @IsEmail()
  @MaxLength(320)
  email!: string;
}
