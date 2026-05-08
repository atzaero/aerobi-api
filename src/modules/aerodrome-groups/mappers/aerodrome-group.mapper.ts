import type { AerodromeGroup } from '@/generated/prisma/client';

import { AerodromeGroupResponseDTO } from '../dtos/aerodrome-group-response.dto';

export class AerodromeGroupMapper {
  static toApiRow(entity: AerodromeGroup): AerodromeGroupResponseDTO {
    const row = new AerodromeGroupResponseDTO();
    row.id = entity.id;
    row.uf = entity.uf;
    row.groupName = entity.groupName;
    row.ownerId = entity.ownerId;
    row.deletionRequested = entity.deletionRequested;
    row.createdAt = entity.createdAt.toISOString();
    row.createdBy = entity.createdBy;
    row.updatedAt = entity.updatedAt.toISOString();
    row.updatedBy = entity.updatedBy;
    row.deletedAt = entity.deletedAt ? entity.deletedAt.toISOString() : null;
    row.deletedBy = entity.deletedBy;
    return row;
  }

  static toApiRows(entities: AerodromeGroup[]): AerodromeGroupResponseDTO[] {
    return entities.map((e) => AerodromeGroupMapper.toApiRow(e));
  }
}
