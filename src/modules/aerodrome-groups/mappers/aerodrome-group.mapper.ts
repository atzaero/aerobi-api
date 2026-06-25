import type { AerodromeGroup } from '@/generated/prisma/client';

import { AerodromeGroupDeletionResponseDTO } from '../dtos/aerodrome-group-deletion-response.dto';
import { AerodromeGroupResponseDTO } from '../dtos/aerodrome-group-response.dto';

export class AerodromeGroupMapper {
  /**
   * Projeta a entidade no response. `imageUrl` é a presigned URL já resolvida
   * (best-effort) a partir de `imageKey` — `null` quando não há imagem ou a
   * assinatura falhou. O default `null` cobre fluxos sem storage.
   */
  static toApiRow(
    entity: AerodromeGroup,
    imageUrl: string | null = null,
  ): AerodromeGroupResponseDTO {
    const row = new AerodromeGroupResponseDTO();
    row.id = entity.id;
    row.uf = entity.uf;
    row.name = entity.name;
    row.imageUrl = imageUrl;
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

  /**
   * Projeção do soft-delete: o grupo removido + a contagem de aeródromos
   * fechados na cascata.
   */
  static toDeletionResult(
    entity: AerodromeGroup,
    affectedAerodromes: number,
    imageUrl: string | null = null,
  ): AerodromeGroupDeletionResponseDTO {
    return Object.assign(
      new AerodromeGroupDeletionResponseDTO(),
      AerodromeGroupMapper.toApiRow(entity, imageUrl),
      { affectedAerodromes },
    );
  }
}
