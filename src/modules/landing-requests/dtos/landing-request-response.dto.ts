import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { LandingRequestStatus } from '@/generated/prisma/client';

export class LandingRequestResponseDTO {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  aerodromeId!: string;

  @ApiProperty({ enum: LandingRequestStatus })
  status!: LandingRequestStatus;

  @ApiProperty({ type: String, format: 'date-time' })
  requestDate!: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  email!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  pilotCode!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  aircraftModel!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  aircraftRegistration!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  departureAerodrome!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  observation!: string | null;

  @ApiPropertyOptional({ type: String, format: 'date-time', nullable: true })
  reviewedAt!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  reviewedBy!: string | null;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  createdBy!: string | null;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt!: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  updatedBy!: string | null;

  @ApiPropertyOptional({ type: String, format: 'date-time', nullable: true })
  deletedAt!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  deletedBy!: string | null;
}
