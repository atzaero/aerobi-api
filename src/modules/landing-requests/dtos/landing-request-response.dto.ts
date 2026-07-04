import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { LandingRequestStatus, UserRole, Uf } from '@/generated/prisma/client';

import { LandingRequestAircraftResponseDTO } from './landing-request-aircraft-response.dto';

/**
 * Ator que revisou a solicitação, resolvido do `users` a partir de `reviewedBy`
 * (decisão 7 da #377 — join em vez de snapshot desnormalizado). `null` quando a
 * solicitação ainda está pendente ou o revisor não é um usuário resolvível.
 */
export class LandingRequestReviewerDTO {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty({ enum: UserRole })
  role!: UserRole;
}

/**
 * Resposta de uma solicitação de pouso na moderação interna. O CPF do piloto sai
 * **mascarado** (`XXX.XXX.***-**`); `answer` é derivado do `status`; `reviewer` é
 * resolvido de `reviewedBy`. Campos de soft-delete (`deletedAt`/`deletedBy`)
 * **não** são expostos. `rabAircraft` só é preenchido no `GET /:id`.
 */
export class LandingRequestResponseDTO {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  aerodromeId!: string;

  @ApiProperty({ enum: LandingRequestStatus })
  status!: LandingRequestStatus;

  @ApiPropertyOptional({
    type: Boolean,
    nullable: true,
    description:
      'Derivado do status: APPROVED→true, REJECTED→false, PENDING→null',
  })
  answer!: boolean | null;

  @ApiProperty({ type: String, format: 'date-time' })
  requestDate!: string;

  @ApiPropertyOptional({ enum: Uf, nullable: true })
  uf!: Uf | null;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'ICAO de chegada',
  })
  icao!: string | null;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'ICAO de partida',
  })
  departureAerodrome!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  nextDestinationAerodrome!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  email!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  requesterName!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  phoneContact!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  pilotName!: string | null;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'CPF do piloto mascarado (XXX.XXX.***-**)',
  })
  pilotCpf!: string | null;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'Código ANAC',
  })
  pilotCode!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  aircraftModel!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  aircraftRegistration!: string | null;

  @ApiPropertyOptional({ type: Boolean, nullable: true })
  foreignRegistration!: boolean | null;

  @ApiPropertyOptional({ type: Number, nullable: true })
  peopleOnBoard!: number | null;

  @ApiPropertyOptional({ type: Boolean, nullable: true })
  acceptedTerms!: boolean | null;

  @ApiPropertyOptional({ type: Boolean, nullable: true })
  confirmedTrue!: boolean | null;

  @ApiPropertyOptional({ type: String, format: 'date-time', nullable: true })
  departureAt!: string | null;

  @ApiPropertyOptional({ type: String, format: 'date-time', nullable: true })
  landingAt!: string | null;

  @ApiPropertyOptional({ type: String, format: 'date-time', nullable: true })
  exitAfterLandingAt!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  observation!: string | null;

  @ApiPropertyOptional({ type: String, format: 'date-time', nullable: true })
  reviewedAt!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  reviewedBy!: string | null;

  @ApiPropertyOptional({ type: LandingRequestReviewerDTO, nullable: true })
  reviewer!: LandingRequestReviewerDTO | null;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  createdBy!: string | null;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt!: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  updatedBy!: string | null;

  @ApiPropertyOptional({
    type: LandingRequestAircraftResponseDTO,
    nullable: true,
  })
  rabAircraft?: LandingRequestAircraftResponseDTO | null;
}
