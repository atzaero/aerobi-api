import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { Uf } from '@/generated/prisma/client';

import { TechnicalVisitModifierResponseDTO } from './technical-visit-modifier-response.dto';
import {
  TECHNICAL_VISIT_EXAMPLE_AERODROME_ID,
  TECHNICAL_VISIT_EXAMPLE_AERODROME_NAME,
  TECHNICAL_VISIT_EXAMPLE_ALTITUDE,
  TECHNICAL_VISIT_EXAMPLE_CIAD,
  TECHNICAL_VISIT_EXAMPLE_CITY,
  TECHNICAL_VISIT_EXAMPLE_DESIGNATION,
  TECHNICAL_VISIT_EXAMPLE_ICAO,
  TECHNICAL_VISIT_EXAMPLE_LENGTH,
  TECHNICAL_VISIT_EXAMPLE_RESISTANCE,
  TECHNICAL_VISIT_EXAMPLE_SURFACE,
  TECHNICAL_VISIT_EXAMPLE_UF,
  TECHNICAL_VISIT_EXAMPLE_VISIT_ID,
  TECHNICAL_VISIT_EXAMPLE_WIDTH,
} from '../docs/technical-visit.examples';

/** Resposta alinhada ao model TechnicalVisit + join aeródromo e modificadores. */
export class TechnicalVisitResponseDTO {
  @ApiProperty({ format: 'uuid', example: TECHNICAL_VISIT_EXAMPLE_VISIT_ID })
  id!: string;

  @ApiProperty({
    format: 'uuid',
    example: TECHNICAL_VISIT_EXAMPLE_AERODROME_ID,
  })
  aerodromeId!: string;

  @ApiPropertyOptional({
    enum: Object.values(Uf),
    type: String,
    example: TECHNICAL_VISIT_EXAMPLE_UF,
    description: 'UF derivada do grupo do aeródromo (join)',
  })
  uf!: Uf | null;

  @ApiProperty({ example: TECHNICAL_VISIT_EXAMPLE_ICAO })
  icao!: string;

  @ApiProperty({ example: TECHNICAL_VISIT_EXAMPLE_AERODROME_NAME })
  aerodromeName!: string;

  @ApiProperty({ example: 'João Silva' })
  visitorName!: string;

  @ApiProperty({ example: TECHNICAL_VISIT_EXAMPLE_CITY })
  city!: string;

  @ApiPropertyOptional({ type: String, example: TECHNICAL_VISIT_EXAMPLE_CIAD })
  ciad!: string | null;

  @ApiPropertyOptional({
    type: String,
    example: TECHNICAL_VISIT_EXAMPLE_DESIGNATION,
  })
  designation!: string | null;

  @ApiPropertyOptional({
    type: String,
    example: TECHNICAL_VISIT_EXAMPLE_LENGTH,
  })
  length!: string | null;

  @ApiPropertyOptional({ type: String, example: TECHNICAL_VISIT_EXAMPLE_WIDTH })
  width!: string | null;

  @ApiPropertyOptional({
    type: String,
    example: TECHNICAL_VISIT_EXAMPLE_RESISTANCE,
  })
  resistance!: string | null;

  @ApiPropertyOptional({
    type: String,
    example: TECHNICAL_VISIT_EXAMPLE_SURFACE,
  })
  surface!: string | null;

  @ApiPropertyOptional({
    type: String,
    example: TECHNICAL_VISIT_EXAMPLE_ALTITUDE,
  })
  altitude!: string | null;

  @ApiProperty({ type: [String], description: 'Uids dos editores (ordem)' })
  modifierUsers!: string[];

  @ApiProperty({ type: [TechnicalVisitModifierResponseDTO] })
  modifiers!: TechnicalVisitModifierResponseDTO[];

  @ApiPropertyOptional({ nullable: true, type: String })
  gatesPadlocksObservation!: string | null;

  @ApiPropertyOptional({ nullable: true, type: Boolean })
  hasGatesPadlocks!: boolean | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  fenceObservation!: string | null;

  @ApiPropertyOptional({ nullable: true, type: Boolean })
  hasFence!: boolean | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  standardPlateObservation!: string | null;

  @ApiPropertyOptional({ nullable: true, type: Boolean })
  hasStandardPlate!: boolean | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  qualityObservation!: string | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  qualityOthersObservation!: string | null;

  @ApiPropertyOptional({ nullable: true, type: Boolean })
  hasQualityHoles!: boolean | null;

  @ApiPropertyOptional({ nullable: true, type: Boolean })
  hasQualityAsphalt!: boolean | null;

  @ApiPropertyOptional({ nullable: true, type: Boolean })
  hasQualityOthers!: boolean | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  horizontalSignageObservation!: string | null;

  @ApiPropertyOptional({ nullable: true, type: Boolean })
  hasHorizontalSignage!: boolean | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  unobstructedHeadboardsObservation!: string | null;

  @ApiPropertyOptional({ nullable: true, type: Boolean })
  hasUnobstructedHeadboards!: boolean | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  trackRangeObservation!: string | null;

  @ApiPropertyOptional({ nullable: true, type: Boolean })
  hasTrackRange!: boolean | null;

  @ApiPropertyOptional({ nullable: true, type: Boolean })
  pavementRegularity!: boolean | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  trashDebrisObservation!: string | null;

  @ApiPropertyOptional({ nullable: true, type: Boolean })
  hasTrashDebris!: boolean | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  delimitedPerimeterObservation!: string | null;

  @ApiPropertyOptional({ nullable: true, type: Boolean })
  hasDelimitedPerimeter!: boolean | null;

  @ApiPropertyOptional({ nullable: true, type: Boolean })
  hasInvasion!: boolean | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  extraObservation!: string | null;

  @ApiProperty({ type: String, format: 'date-time' })
  visitAt!: string;

  @ApiPropertyOptional({ nullable: true, type: String })
  visitBy!: string | null;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: string;

  @ApiPropertyOptional({ nullable: true, type: String })
  createdBy!: string | null;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt!: string;

  @ApiPropertyOptional({ nullable: true, type: String })
  updatedBy!: string | null;

  @ApiPropertyOptional({ nullable: true, type: String, format: 'date-time' })
  deletedAt!: string | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  deletedBy!: string | null;
}
