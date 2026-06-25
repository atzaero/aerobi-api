import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

import { BasePaginationQueryDTO } from '@/common/dtos/base-pagination-query.dto';
import { TrimOptionalString } from '@/common/transform';
import { Uf } from '@/generated/prisma/client';

export class ListAerodromeGroupsQueryDTO extends BasePaginationQueryDTO {
  @ApiPropertyOptional({ enum: Uf })
  @IsOptional()
  @IsEnum(Uf)
  uf?: Uf;

  @ApiPropertyOptional({
    description: 'Filtra por nome do grupo (substring, case-insensitive).',
  })
  @IsOptional()
  @TrimOptionalString()
  @IsString()
  @MaxLength(500)
  name?: string;
}
