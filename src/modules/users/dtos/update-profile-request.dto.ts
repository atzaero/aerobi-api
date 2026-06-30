import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

import { NormalizeOptionalPhone, TrimOptionalString } from '@/common/transform';
import { IsE164Phone } from '@/common/validators/is-e164-phone.validator';

/**
 * Auto-edição de perfil (`PATCH /users/me`) — espelha a action `update-profile`
 * do `aerobi-web`. Qualquer usuário autenticado edita os próprios `name`/`phone`/
 * `timezone`. **Não** inclui `email`/`role` (mudança administrativa) nem senha
 * (`POST /users/me/change-password`). Campos opcionais: só os enviados mudam.
 */
export class UpdateProfileRequestDto {
  @ApiPropertyOptional()
  @IsOptional()
  @TrimOptionalString()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({ example: '+55 11 99999-0000', nullable: true })
  @IsOptional()
  @NormalizeOptionalPhone()
  @IsE164Phone()
  @MaxLength(32)
  phone?: string | null;

  @ApiPropertyOptional({ example: 'America/Sao_Paulo', nullable: true })
  @IsOptional()
  @TrimOptionalString()
  @IsString()
  @MaxLength(64)
  timezone?: string;
}
