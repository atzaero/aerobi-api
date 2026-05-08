import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

import { Uf } from '@/generated/prisma/client';

import { BasePaginationQueryDTO } from '@/common/dtos/base-pagination-query.dto';

export class ListAerodromeGroupsQueryDTO extends BasePaginationQueryDTO {
  @ApiPropertyOptional({ enum: Uf })
  @IsOptional()
  @IsEnum(Uf)
  uf?: Uf;
}
