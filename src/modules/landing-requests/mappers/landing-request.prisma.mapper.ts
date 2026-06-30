import type { Prisma } from '@/generated/prisma/client';

import { CreateLandingRequestDTO } from '../dtos/create-landing-request.dto';
import { UpdateLandingRequestDTO } from '../dtos/update-landing-request.dto';

export function buildLandingRequestCreateInput(
  dto: CreateLandingRequestDTO,
): Prisma.LandingRequestCreateInput {
  return {
    aerodrome: {
      connect: { id: dto.aerodromeId },
    },
    status: dto.status,
    requestDate: dto.requestDate,
    email: dto.email,
    pilotCode: dto.pilotCode,
    aircraftModel: dto.aircraftModel,
    aircraftRegistration: dto.aircraftRegistration,
    departureAerodrome: dto.departureAerodrome,
    observation: dto.observation,
    reviewedAt: dto.reviewedAt,
    reviewedBy: dto.reviewedBy,
    createdBy: dto.createdBy,
  };
}

export function patchLandingRequestToPrisma(
  dto: UpdateLandingRequestDTO,
): Prisma.LandingRequestUpdateInput {
  const data: Prisma.LandingRequestUpdateInput = {};
  if (dto.status !== undefined) data.status = dto.status;
  if (dto.requestDate !== undefined) data.requestDate = dto.requestDate;
  if (dto.email !== undefined) data.email = dto.email;
  if (dto.pilotCode !== undefined) data.pilotCode = dto.pilotCode;
  if (dto.aircraftModel !== undefined) {
    data.aircraftModel = dto.aircraftModel;
  }
  if (dto.aircraftRegistration !== undefined) {
    data.aircraftRegistration = dto.aircraftRegistration;
  }
  if (dto.departureAerodrome !== undefined) {
    data.departureAerodrome = dto.departureAerodrome;
  }
  if (dto.observation !== undefined) data.observation = dto.observation;
  if (dto.reviewedAt !== undefined) data.reviewedAt = dto.reviewedAt;
  if (dto.reviewedBy !== undefined) data.reviewedBy = dto.reviewedBy;

  if (dto.aerodromeId !== undefined) {
    data.aerodrome = {
      connect: { id: dto.aerodromeId },
    };
  }
  return data;
}
