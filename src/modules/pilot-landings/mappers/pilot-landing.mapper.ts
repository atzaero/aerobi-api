import type { PilotLanding } from '@/generated/prisma/client';

import { PilotLandingResponseDTO } from '../dtos/pilot-landing-response.dto';

export class PilotLandingMapper {
  static toApiRow(entity: PilotLanding): PilotLandingResponseDTO {
    const row = new PilotLandingResponseDTO();
    row.id = entity.id;
    row.operationalAerodromeId = entity.operationalAerodromeId;
    row.registration = entity.registration;
    row.localName = entity.localName;
    row.localIcao = entity.localIcao;
    row.checked = entity.checked;
    row.imagesPath = entity.imagesPath;
    row.landingAt = entity.landingAt.toISOString();
    row.createdAt = entity.createdAt.toISOString();
    row.createdBy = entity.createdBy;
    row.updatedAt = entity.updatedAt.toISOString();
    row.updatedBy = entity.updatedBy;
    row.deletedAt = entity.deletedAt ? entity.deletedAt.toISOString() : null;
    row.deletedBy = entity.deletedBy;
    return row;
  }

  static toApiRows(entities: PilotLanding[]): PilotLandingResponseDTO[] {
    return entities.map((e) => PilotLandingMapper.toApiRow(e));
  }
}
