import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

import { UserRole } from '@/generated/prisma/client';

export class CreateUserRequestDto {
  @ApiProperty({ format: 'email', example: 'piloto@aerobi.local' })
  @IsEmail()
  @MaxLength(320)
  email!: string;

  @ApiProperty({ example: 'João da Silva' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name!: string;

  @ApiProperty({ enum: UserRole, example: UserRole.OPERATOR })
  @IsEnum(UserRole)
  role!: UserRole;

  @ApiPropertyOptional({ example: '+55 11 99999-0000' })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  phone?: string;
}
