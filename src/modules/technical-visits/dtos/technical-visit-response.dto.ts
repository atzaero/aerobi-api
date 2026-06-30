import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** Resposta alinhada ao model TechnicalVisit */
export class TechnicalVisitResponseDTO {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  aerodromeId!: string;

  @ApiProperty({ type: [String], description: 'Editores/modificadores' })
  modifierUsers!: string[];

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
