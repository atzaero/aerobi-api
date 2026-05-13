import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, MaxLength } from 'class-validator';

export class RequestPasswordResetDto {
  @ApiProperty({ format: 'email' })
  @IsEmail()
  @MaxLength(320)
  email!: string;
}
