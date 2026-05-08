import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';

import { FeedbackRating } from '@/generated/prisma/client';

import { BasePaginationQueryDTO } from '@/common/dtos/base-pagination-query.dto';

export class ListAerodromeFeedbacksQueryDTO extends BasePaginationQueryDTO {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('4')
  operationalAerodromeId?: string;

  @ApiPropertyOptional({ enum: FeedbackRating })
  @IsOptional()
  @IsEnum(FeedbackRating)
  rating?: FeedbackRating;
}
