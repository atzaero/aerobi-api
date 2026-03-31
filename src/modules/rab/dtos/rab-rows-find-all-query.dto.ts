import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, Matches } from 'class-validator';

import { BasePaginationQueryDTO } from '@/common/dtos/base-pagination-query.dto';

export class RabRowsFindAllQueryDTO extends BasePaginationQueryDTO {
  @ApiPropertyOptional({
    description:
      'Período de referência (YYYY-MM), e.g. 2026-03. Se omitido ou vazio, usa o período mais recente disponível no índice ANAC (mesmo critério de GET /rab/latest-period).',
    example: '2026-03',
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (value === '' || value === null || value === undefined) {
      return undefined;
    }
    if (typeof value === 'string') {
      const trimmed = value.trim();
      return trimmed === '' ? undefined : trimmed;
    }
    return value;
  })
  @IsString()
  @Matches(/^\d{4}-\d{2}$/, { message: 'period must be YYYY-MM' })
  period?: string;

  @ApiPropertyOptional({
    description:
      'Filter by aircraft registration (marcas); partial match, case-insensitive',
  })
  @IsOptional()
  @IsString()
  marcas?: string;

  @ApiPropertyOptional({
    description:
      'Filter by certificate registration number (nr_cert_matricula); partial match, case-insensitive',
  })
  @IsOptional()
  @IsString()
  nrCertMatricula?: string;

  @ApiPropertyOptional({
    description: 'Filter by manufacturer name; partial match, case-insensitive',
  })
  @IsOptional()
  @IsString()
  nmFabricante?: string;

  @ApiPropertyOptional({
    description: 'Filter by model description; partial match, case-insensitive',
  })
  @IsOptional()
  @IsString()
  dsModelo?: string;

  @ApiPropertyOptional({
    description: 'Filter by ICAO type code; partial match, case-insensitive',
  })
  @IsOptional()
  @IsString()
  cdTipoIcao?: string;
}
