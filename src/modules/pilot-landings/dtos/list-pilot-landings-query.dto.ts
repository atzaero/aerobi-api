import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

import { BasePaginationQueryDTO } from '@/common/dtos/base-pagination-query.dto';

/** Query params para GET /pilot-landings */
export class ListPilotLandingsQueryDTO extends BasePaginationQueryDTO {
  @ApiPropertyOptional({
    description: 'Filtrar pelo aeródromo operacional',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID('4')
  operationalAerodromeId?: string;

  @ApiPropertyOptional({
    description: 'Filtra por matrícula (substring, case insensitive)',
    example: 'PT-',
  })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  registration?: string;
}
