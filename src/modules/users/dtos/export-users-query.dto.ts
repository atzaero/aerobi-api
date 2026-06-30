import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

import { TrimOptionalString } from '@/common/transform';
import { UserRole } from '@/generated/prisma/client';

/**
 * Filtros do export CSV de usuários — mesmos da listagem (`search`/`role`/
 * `groupId`), **sem paginação**: traz todas as linhas do escopo até
 * `EXPORT_MAX_ROWS`. COORDINATOR é restrito ao próprio grupo no service.
 */
export class ExportUsersQueryDto {
  @ApiPropertyOptional({ description: 'Filtra por email ou nome (ILIKE).' })
  @IsOptional()
  @TrimOptionalString()
  @IsString()
  @MaxLength(255)
  search?: string;

  @ApiPropertyOptional({ enum: UserRole })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  groupId?: string;
}
