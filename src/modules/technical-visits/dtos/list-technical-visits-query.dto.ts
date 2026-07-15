import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

import { BasePaginationQueryDTO } from '@/common/dtos/base-pagination-query.dto';
import { TrimString } from '@/common/validators/trim-to-null.transform';

import {
  TECHNICAL_VISIT_EXAMPLE_AERODROME_ID,
  TECHNICAL_VISIT_EXAMPLE_ICAO,
} from '../docs/technical-visit.examples';

export class ListTechnicalVisitsQueryDTO extends BasePaginationQueryDTO {
  @ApiPropertyOptional({
    format: 'uuid',
    example: TECHNICAL_VISIT_EXAMPLE_AERODROME_ID,
  })
  @IsOptional()
  @IsUUID('4')
  aerodromeId?: string;

  @ApiPropertyOptional({
    description:
      'Busca substring em visitorName, city, icao e aerodromeName (case-insensitive)',
    example: TECHNICAL_VISIT_EXAMPLE_ICAO,
  })
  @IsOptional()
  @TrimString()
  @IsString()
  search?: string;
}
