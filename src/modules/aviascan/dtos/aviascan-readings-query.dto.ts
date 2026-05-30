import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches } from 'class-validator';

import { BasePaginationQueryDTO } from '@/common/dtos/base-pagination-query.dto';

/** Formato de data aceito pelos filtros do upstream AviaScan: `YYYY-MM-DD`. */
const DATE_FORMAT = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Query do proxy AviaScan `GET /aviascan/readings/paginated`.
 *
 * Herda `page` / `limit` (paginação offset padrão) e adiciona os filtros
 * suportados pelo upstream. Todos os filtros são opcionais e encaminhados
 * tal como recebidos.
 */
export class AviascanReadingsQueryDto extends BasePaginationQueryDTO {
  @ApiPropertyOptional({
    example: 'PS-KDV',
    description: 'Filtra pela matrícula da aeronave (registration).',
  })
  @IsOptional()
  @IsString()
  registration?: string;

  @ApiPropertyOptional({
    example: 'SSCF',
    description: 'Filtra pelo código do aeródromo.',
  })
  @IsOptional()
  @IsString()
  aerodrome?: string;

  @ApiPropertyOptional({
    example: '2026-05-01',
    description:
      'Data inicial no formato `YYYY-MM-DD` (filtra `reading_datetime`).',
  })
  @IsOptional()
  @IsString()
  @Matches(DATE_FORMAT, {
    message: 'start_date deve estar no formato YYYY-MM-DD',
  })
  start_date?: string;

  @ApiPropertyOptional({
    example: '2026-05-31',
    description:
      'Data final no formato `YYYY-MM-DD` (filtra `reading_datetime`).',
  })
  @IsOptional()
  @IsString()
  @Matches(DATE_FORMAT, {
    message: 'end_date deve estar no formato YYYY-MM-DD',
  })
  end_date?: string;
}
