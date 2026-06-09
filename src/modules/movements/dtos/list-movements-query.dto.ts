import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

import { BasePaginationQueryDTO } from '@/common/dtos/base-pagination-query.dto';
import { IsYmdDate } from '@/common/validators/is-ymd-date.validator';

/**
 * Query de `GET /readings`. Herda `page`/`limit` e adiciona os mesmos filtros do
 * proxy AviaScan legado (registration, aerodrome, intervalo de datas) + status.
 */
export class ListMovementsQueryDTO extends BasePaginationQueryDTO {
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
