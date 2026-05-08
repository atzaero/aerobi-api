import type { LandingRequest } from '@/generated/prisma/client';

import { LandingRequestResponseDTO } from '../dtos/landing-request-response.dto';

export class LandingRequestMapper {
  static toApiRow(entity: LandingRequest): LandingRequestResponseDTO {
    const row = new LandingRequestResponseDTO();
    row.id = entity.id;
    row.operationalAerodromeId = entity.operationalAerodromeId;
    row.status = entity.status;
    row.requestDate = entity.requestDate.toISOString();
    row.email = entity.email;
    row.pilotCode = entity.pilotCode;
    row.aircraftModel = entity.aircraftModel;
    row.aircraftRegistration = entity.aircraftRegistration;
    row.departureAerodrome = entity.departureAerodrome;
    row.observation = entity.observation;
    row.reviewedAt = entity.reviewedAt ? entity.reviewedAt.toISOString() : null;
    row.reviewedBy = entity.reviewedBy;
    row.createdAt = entity.createdAt.toISOString();
    row.createdBy = entity.createdBy;
    row.updatedAt = entity.updatedAt.toISOString();
    row.updatedBy = entity.updatedBy;
    row.deletedAt = entity.deletedAt ? entity.deletedAt.toISOString() : null;
    row.deletedBy = entity.deletedBy;
    return row;
  }

  static toApiRows(entities: LandingRequest[]): LandingRequestResponseDTO[] {
    return entities.map((e) => LandingRequestMapper.toApiRow(e));
  }
}
