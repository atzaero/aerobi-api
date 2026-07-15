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
 * Filtros compartilhados de listagem e exportação de aeródromos, alinhados ao
 * web (`uf`/`search`/`isOpen`/`isView`). `search` é substring case-insensitive em
 * ICAO/nome/município; `uf` filtra pela relação `group.uf` (UF derivada);
 * `groupId` é um extra útil ao ADMIN (os demais papéis já ficam presos ao próprio
 * grupo pelo escopo). Fonte única para `ListAerodromesQueryDTO` (via
 * `IntersectionType` com a paginação) e `ExportAerodromesQueryDTO`.
 */
export class AerodromeFilterQueryDTO {
  @ApiPropertyOptional({ enum: Uf, description: 'Filtra pela UF do grupo' })
  @IsOptional()
  @IsEnum(Uf)
  uf?: Uf;

  @ApiPropertyOptional({
    description:
      'Busca por substring (case-insensitive) em ICAO, nome ou município',
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
