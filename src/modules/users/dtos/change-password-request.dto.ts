import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

import { IsStrongPassword } from '@/common/validators/is-strong-password.validator';

/**
 * Troca de senha pelo próprio usuário (`POST /users/me/change-password`) —
 * espelha a parte de senha do `update-profile` do `aerobi-web`. Exige a senha
 * atual (verificada via bcrypt no service) e uma nova senha forte.
 */
export class ChangePasswordRequestDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  currentPassword!: string;

  @ApiProperty()
  @IsStrongPassword()
  newPassword!: string;
}
