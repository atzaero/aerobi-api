import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

import { BasePaginationQueryDTO } from '@/common/dtos/base-pagination-query.dto';

export class PrivateAerodromesFindAllQueryDTO extends BasePaginationQueryDTO {
  @ApiPropertyOptional({
    description: 'Filter by CIAD code; partial match, case-insensitive',
  })
  @IsOptional()
  @IsString()
  ciad?: string;

  @ApiPropertyOptional({
    description: 'Filter by OACI code; partial match, case-insensitive',
  })
  @IsOptional()
  @IsString()
  codigoOaci?: string;

  @ApiPropertyOptional({
    description: 'Filter by aerodrome name; partial match, case-insensitive',
  })
  @IsOptional()
  @IsString()
  nome?: string;

  @ApiPropertyOptional({
    description: 'Filter by city (municipio); partial match, case-insensitive',
  })
  @IsOptional()
  @IsString()
  municipio?: string;

  @ApiPropertyOptional({
    description: 'Filter by state (UF); partial match, case-insensitive',
  })
  @IsOptional()
  @IsString()
  uf?: string;
}
