import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';

import { LandingRequestStatus } from '@/generated/prisma/client';

import { BasePaginationQueryDTO } from '@/common/dtos/base-pagination-query.dto';

export class ListLandingRequestsQueryDTO extends BasePaginationQueryDTO {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('4')
  operationalAerodromeId?: string;

  @ApiPropertyOptional({ enum: LandingRequestStatus })
  @IsOptional()
  @IsEnum(LandingRequestStatus)
  status?: LandingRequestStatus;
}
