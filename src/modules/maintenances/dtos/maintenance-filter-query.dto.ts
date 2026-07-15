import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

import { Uf } from '@/generated/prisma/client';

/**
 * Filtros de listagem/export de intervenções.
 */
export class MaintenanceFilterQueryDTO {
  @ApiPropertyOptional({ description: 'Busca por nome (substring).' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  aerodromeId?: string;

  @ApiPropertyOptional({
    description: 'Busca parcial no nome/ICAO do aeródromo.',
  })
  @IsOptional()
  @IsString()
  aerodromeName?: string;

  @ApiPropertyOptional({ enum: Uf })
  @IsOptional()
  @IsEnum(Uf)
  uf?: Uf;

  @ApiPropertyOptional({
    description: 'true = com acesso público; false = sem.',
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean()
  publicAccess?: boolean;

  @ApiPropertyOptional({
    description: 'true = com tarefas pendentes em atraso.',
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean()
  overduePending?: boolean;
}
