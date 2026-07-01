import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';

import { GeojsonStatus } from '@/generated/prisma/client';

import { BasePaginationQueryDTO } from '@/common/dtos/base-pagination-query.dto';

export class ListGeojsonsQueryDTO extends BasePaginationQueryDTO {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('4')
  aerodromeId?: string;

  @ApiPropertyOptional({ enum: GeojsonStatus })
  @IsOptional()
  @IsEnum(GeojsonStatus)
  status?: GeojsonStatus;
}
