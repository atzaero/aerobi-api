import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches } from 'class-validator';

import { BasePaginationQueryDTO } from '@/common/dtos/base-pagination-query.dto';

/** Filtro de data por dia (`YYYY-MM-DD`), aplicado sobre `reading_datetime`. */
const DATE_FORMAT = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Query de `GET /readings`. Herda `page`/`limit` e adiciona os mesmos filtros do
 * proxy AviaScan legado (registration, aerodrome, intervalo de datas) + status.
 */
export class ListAircraftReadingsQueryDTO extends BasePaginationQueryDTO {
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
    example: '2026-05-01',
    description: 'Data inicial (YYYY-MM-DD), inclusiva.',
  })
  @IsOptional()
  @IsString()
  @Matches(DATE_FORMAT, {
    message: 'start_date deve estar no formato YYYY-MM-DD',
  })
  start_date?: string;

  @ApiPropertyOptional({
    example: '2026-05-31',
    description: 'Data final (YYYY-MM-DD), inclusiva.',
  })
  @IsOptional()
  @IsString()
  @Matches(DATE_FORMAT, {
    message: 'end_date deve estar no formato YYYY-MM-DD',
  })
  end_date?: string;
}
