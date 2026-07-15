import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

import { UserRole } from '@/generated/prisma/client';

import {
  NormalizeEmail,
  NormalizeOptionalPhone,
  TrimOptionalString,
} from '@/common/transform';
import { IsE164Phone } from '@/common/validators/is-e164-phone.validator';

/**
 * Edição **administrativa** de um usuário (`PATCH /users/:id`) — espelha a action
 * `update` do `aerobi-web`. Cobre `name`/`email`/`role`/`phone`; não toca
 * `timezone` (preferência pessoal, editável só pelo próprio em `PATCH /users/me`)
 * nem grupo/UF. Todos os campos são opcionais (PATCH): só os enviados mudam.
 */
export class AdminUpdateUserRequestDto {
  @ApiPropertyOptional()
  @IsOptional()
  @TrimOptionalString()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({ format: 'email' })
  @IsOptional()
  @NormalizeEmail()
  @IsEmail()
  @MaxLength(320)
  email?: string;

  @ApiPropertyOptional({ example: '+55 11 99999-0000', nullable: true })
  @IsOptional()
  @NormalizeOptionalPhone()
  @IsE164Phone()
  @MaxLength(32)
  phone?: string | null;

  @ApiPropertyOptional({
    enum: UserRole,
    description:
      'COORDINATOR pode atribuir OPERATOR/TECHNICAL/COORDINATOR (nunca ADMIN); ADMIN qualquer.',
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
