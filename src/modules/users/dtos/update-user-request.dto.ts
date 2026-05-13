import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

import { UserRole } from '@/generated/prisma/client';

import { TrimOptionalString } from '@/common/transform';

export class UpdateUserRequestDto {
  @ApiPropertyOptional()
  @IsOptional()
  @TrimOptionalString()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @TrimOptionalString()
  @IsString()
  @MaxLength(32)
  phone?: string;

  @ApiPropertyOptional({ example: 'America/Sao_Paulo' })
  @IsOptional()
  @TrimOptionalString()
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
