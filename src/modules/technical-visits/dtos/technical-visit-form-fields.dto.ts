import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

import { IsNotFutureDate } from '@/common/validators/is-not-future-date.validator';
import {
  TrimString,
  TrimToNull,
} from '@/common/validators/trim-to-null.transform';

import {
  TECHNICAL_VISIT_EXAMPLE_ALTITUDE,
  TECHNICAL_VISIT_EXAMPLE_CIAD,
  TECHNICAL_VISIT_EXAMPLE_CITY,
  TECHNICAL_VISIT_EXAMPLE_DESIGNATION,
  TECHNICAL_VISIT_EXAMPLE_LENGTH,
  TECHNICAL_VISIT_EXAMPLE_RESISTANCE,
  TECHNICAL_VISIT_EXAMPLE_SURFACE,
  TECHNICAL_VISIT_EXAMPLE_WIDTH,
} from '../docs/technical-visit.examples';

/**
 * Campos de formulário compartilhados entre create e update de visita técnica —
 * paridade `visit-form-action-schema.ts` do web.
 */
export class TechnicalVisitFormFieldsDTO {
  @ApiProperty()
  @TrimString()
  @IsString()
  @IsNotEmpty()
  visitorName!: string;

  @ApiProperty({ example: TECHNICAL_VISIT_EXAMPLE_CITY })
  @TrimString()
  @IsString()
  @IsNotEmpty()
  city!: string;

  @ApiPropertyOptional({ type: String, example: TECHNICAL_VISIT_EXAMPLE_CIAD })
  @TrimToNull()
  @IsOptional()
  @IsString()
  ciad?: string | null;

  @ApiPropertyOptional({
    type: String,
    example: TECHNICAL_VISIT_EXAMPLE_DESIGNATION,
  })
  @TrimToNull()
  @IsOptional()
  @IsString()
  designation?: string | null;

  @ApiPropertyOptional({
    type: String,
    example: TECHNICAL_VISIT_EXAMPLE_LENGTH,
  })
  @TrimToNull()
  @IsOptional()
  @IsString()
  length?: string | null;

  @ApiPropertyOptional({ type: String, example: TECHNICAL_VISIT_EXAMPLE_WIDTH })
  @TrimToNull()
  @IsOptional()
  @IsString()
  width?: string | null;

  @ApiPropertyOptional({
    type: String,
    example: TECHNICAL_VISIT_EXAMPLE_RESISTANCE,
  })
  @TrimToNull()
  @IsOptional()
  @IsString()
  resistance?: string | null;

  @ApiPropertyOptional({
    type: String,
    example: TECHNICAL_VISIT_EXAMPLE_SURFACE,
  })
  @TrimToNull()
  @IsOptional()
  @IsString()
  surface?: string | null;

  @ApiPropertyOptional({
    type: String,
    example: TECHNICAL_VISIT_EXAMPLE_ALTITUDE,
  })
  @TrimToNull()
  @IsOptional()
  @IsString()
  altitude?: string | null;

  @ApiPropertyOptional({ type: String })
  @TrimToNull()
  @IsOptional()
  @IsString()
  gatesPadlocksObservation?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasGatesPadlocks?: boolean;

  @ApiPropertyOptional({ type: String })
  @TrimToNull()
  @IsOptional()
  @IsString()
  fenceObservation?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasFence?: boolean;

  @ApiPropertyOptional({ type: String })
  @TrimToNull()
  @IsOptional()
  @IsString()
  standardPlateObservation?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasStandardPlate?: boolean;

  @ApiPropertyOptional({ type: String })
  @TrimToNull()
  @IsOptional()
  @IsString()
  qualityObservation?: string | null;

  @ApiPropertyOptional({ type: String })
  @TrimToNull()
  @IsOptional()
  @IsString()
  qualityOthersObservation?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasQualityHoles?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasQualityAsphalt?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasQualityOthers?: boolean;

  @ApiPropertyOptional({ type: String })
  @TrimToNull()
  @IsOptional()
  @IsString()
  horizontalSignageObservation?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasHorizontalSignage?: boolean;

  @ApiPropertyOptional({ type: String })
  @TrimToNull()
  @IsOptional()
  @IsString()
  unobstructedHeadboardsObservation?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasUnobstructedHeadboards?: boolean;

  @ApiPropertyOptional({ type: String })
  @TrimToNull()
  @IsOptional()
  @IsString()
  trackRangeObservation?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasTrackRange?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  pavementRegularity?: boolean;

  @ApiPropertyOptional({ type: String })
  @TrimToNull()
  @IsOptional()
  @IsString()
  trashDebrisObservation?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasTrashDebris?: boolean;

  @ApiPropertyOptional({ type: String })
  @TrimToNull()
  @IsOptional()
  @IsString()
  delimitedPerimeterObservation?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasDelimitedPerimeter?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasInvasion?: boolean;

  @ApiPropertyOptional({ type: String })
  @TrimToNull()
  @IsOptional()
  @IsString()
  extraObservation?: string | null;

  @ApiProperty({ example: '2024-06-01T09:00:00.000Z' })
  @Type(() => Date)
  @IsDate()
  @IsNotFutureDate()
  visitAt!: Date;
}
