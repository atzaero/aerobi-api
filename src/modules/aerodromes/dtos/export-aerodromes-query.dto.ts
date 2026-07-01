import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

import { OptionalQueryBoolean, TrimOptionalString } from '@/common/transform';
import { Uf } from '@/generated/prisma/client';

/**
 * Filtros do export CSV de aeródromos — mesmas regras da listagem
 * (`uf`/`search`/`isOpen`/`isView`/`groupId`), **sem paginação**: o export traz
 * todas as linhas do escopo até `EXPORT_MAX_ROWS`.
 */
export class ExportAerodromesQueryDTO {
  @ApiPropertyOptional({ enum: Uf, description: 'Filtra pela UF do grupo' })
  @IsOptional()
  @IsEnum(Uf)
  uf?: Uf;

  @ApiPropertyOptional({
    description: 'Substring (case-insensitive) em ICAO, nome ou município',
    example: 'SD',
  })
  @IsOptional()
  @TrimOptionalString()
  @IsString()
  @MaxLength(255)
  search?: string;

  @ApiPropertyOptional({ description: 'Filtra por aeródromo aberto' })
  @IsOptional()
  @OptionalQueryBoolean()
  @IsBoolean()
  isOpen?: boolean;

  @ApiPropertyOptional({ description: 'Filtra por visibilidade pública' })
  @IsOptional()
  @OptionalQueryBoolean()
  @IsBoolean()
  isView?: boolean;

  @ApiPropertyOptional({
    description: 'Filtra pelo grupo (efetivo apenas para ADMIN)',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID('4')
  groupId?: string;
}
