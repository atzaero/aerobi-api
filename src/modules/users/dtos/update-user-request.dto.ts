import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

import { UserRole } from '@/generated/prisma/client';

import { TrimString } from '@/common/validators/transformers';

export class UpdateUserRequestDto {
  @ApiPropertyOptional()
  @IsOptional()
  @TrimString()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @TrimString()
  @IsString()
  @MaxLength(32)
  phone?: string;

  @ApiPropertyOptional({ example: 'America/Sao_Paulo' })
  @IsOptional()
  @TrimString()
  @IsString()
  @MaxLength(64)
  timezone?: string;

  @ApiPropertyOptional({
    enum: UserRole,
    description: 'Apenas ADMIN pode alterar.',
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
