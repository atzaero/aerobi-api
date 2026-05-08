import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

import { FeedbackRating } from '@/generated/prisma/client';

/** Body PATCH — campos opcionais */
export class UpdateAerodromeFeedbackDTO {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('4')
  operationalAerodromeId?: string;

  @ApiPropertyOptional({ enum: FeedbackRating })
  @IsOptional()
  @IsEnum(FeedbackRating)
  rating?: FeedbackRating;

  @ApiPropertyOptional({ maxLength: 10000 })
  @IsOptional()
  @IsString()
  @MaxLength(10000)
  comment?: string;

  @ApiPropertyOptional({
    description: 'Novo hash de sessão (raro)',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  sessionHash?: string;

  @ApiPropertyOptional({ example: '2024-06-01T00:00:00.000Z' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  feedbackDate?: Date;
}
