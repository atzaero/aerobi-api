import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

import { Uf, UserRole } from '@/generated/prisma/client';

import {
  NormalizeEmail,
  TrimOptionalString,
  TrimString,
} from '@/common/transform';

export class CreateUserRequestDto {
  @ApiProperty({ format: 'email', example: 'piloto@aerobi.local' })
  @NormalizeEmail()
  @IsEmail()
  @MaxLength(320)
  email!: string;

  @ApiProperty({ example: 'João da Silva' })
  @TrimString()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name!: string;

  @ApiProperty({ enum: UserRole, example: UserRole.OPERATOR })
  @IsEnum(UserRole)
  role!: UserRole;

  @ApiPropertyOptional({ example: '+55 11 99999-0000' })
  @IsOptional()
  @TrimOptionalString()
  @IsString()
  @MaxLength(32)
  phone?: string;

  /**
   * Grupo de aeródromos do novo user. **Obrigatório quando o ator é ADMIN** e
   * a role alvo é COORDINATOR/OPERATOR/TECHNICAL. Ignorado quando o ator é
   * COORDINATOR (herda o próprio grupo) e quando a role alvo é ADMIN (sem grupo).
   */
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  groupId?: string;

  /**
   * UF do grupo. Mesmas regras de `groupId` — exigido do ADMIN para
   * roles com grupo; ignorado para COORDINATOR (herda) e ADMIN alvo (sem UF).
   */
  @ApiPropertyOptional({ enum: Uf })
  @IsOptional()
  @IsEnum(Uf)
  state?: Uf;
}
