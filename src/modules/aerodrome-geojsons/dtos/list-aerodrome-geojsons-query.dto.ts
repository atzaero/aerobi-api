import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';

import { AerodromeGeojsonStatus } from '@/generated/prisma/client';

import { BasePaginationQueryDTO } from '@/common/dtos/base-pagination-query.dto';

export class ListAerodromeGeojsonsQueryDTO extends BasePaginationQueryDTO {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('4')
  aerodromeId?: string;

  @ApiPropertyOptional({ enum: AerodromeGeojsonStatus })
  @IsOptional()
  @IsEnum(AerodromeGeojsonStatus)
  status?: AerodromeGeojsonStatus;
}
