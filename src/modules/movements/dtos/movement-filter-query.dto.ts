import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

import { IsYmdDate } from '@/common/validators/is-ymd-date.validator';
import {
  ConformityStatus,
  MovementSource,
  MovementType,
} from '@/generated/prisma/enums';

/**
 * Filtros de consulta de movimentos compartilhados pela listagem paginada e pelo
 * export CSV: matrícula, aeródromo, status da leitura, tipo de operação, origem,
 * conformidade e intervalo de datas (`YYYY-MM-DD`). A paginação vive à parte
 * (`BasePaginationQueryDTO`), combinada via `IntersectionType` na listagem.
 */
export class MovementFilterQueryDTO {
  @ApiPropertyOptional({ example: 'PR-ZTT' })
  @IsOptional()
  @IsString()
  registration?: string;

  @ApiPropertyOptional({ example: 'SSCF' })
  @IsOptional()
  @IsString()
  aerodrome?: string;

  @ApiPropertyOptional({ description: 'Filtra leituras com este status.' })
  @IsOptional()
  @IsString()
  reading_status?: string;

  @ApiPropertyOptional({
    enum: MovementType,
    description: 'Filtra pelo tipo de operação (LANDING | TAKEOFF).',
  })
  @IsOptional()
  @IsEnum(MovementType)
  operation_type?: MovementType;

  @ApiPropertyOptional({
    enum: MovementSource,
    description: 'Filtra pela origem do registro (AUTOMATIC | MANUAL).',
  })
  @IsOptional()
  @IsEnum(MovementSource)
  source?: MovementSource;

  @ApiPropertyOptional({
    enum: ConformityStatus,
    description: 'Filtra pela conformidade do movimento.',
  })
  @IsOptional()
  @IsEnum(ConformityStatus)
  conformity_status?: ConformityStatus;

  @ApiPropertyOptional({
    example: '2026-05-01',
    description: 'Data inicial (YYYY-MM-DD), inclusiva.',
  })
  @IsOptional()
  @IsYmdDate()
  start_date?: string;

  @ApiPropertyOptional({
    example: '2026-05-31',
    description: 'Data final (YYYY-MM-DD), inclusiva.',
  })
  @IsOptional()
  @IsYmdDate()
  end_date?: string;
}
