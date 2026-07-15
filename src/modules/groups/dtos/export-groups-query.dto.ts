import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

import { TrimOptionalString } from '@/common/transform';
import { Uf } from '@/generated/prisma/client';

/**
 * Filtros do export CSV de grupos — mesmas regras da listagem (`uf` + `name`),
 * **sem paginação**: o export traz todas as linhas do escopo até
 * `EXPORT_MAX_ROWS`.
 */
export class ExportGroupsQueryDTO {
  @ApiPropertyOptional({ enum: Uf })
  @IsOptional()
  @IsEnum(Uf)
  uf?: Uf;

  @ApiPropertyOptional({
    description: 'Filtra por nome do grupo (substring, case-insensitive).',
  })
  @IsOptional()
  @TrimOptionalString()
  @IsString()
  @MaxLength(500)
  name?: string;
}
