import type { Group } from '@/generated/prisma/client';

import { GroupDeletionResponseDTO } from '../dtos/group-deletion-response.dto';
import { GroupResponseDTO } from '../dtos/group-response.dto';

export class GroupMapper {
  /**
   * Projeta a entidade no response. `imageUrl` é a presigned URL já resolvida
   * (best-effort) a partir de `imageKey` — `null` quando não há imagem ou a
   * assinatura falhou. O default `null` cobre fluxos sem storage.
   */
  static toApiRow(
    entity: Group,
    imageUrl: string | null = null,
  ): GroupResponseDTO {
    const row = new GroupResponseDTO();
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
    entity: Group,
    affectedAerodromes: number,
    imageUrl: string | null = null,
  ): GroupDeletionResponseDTO {
    return Object.assign(
      new GroupDeletionResponseDTO(),
      GroupMapper.toApiRow(entity, imageUrl),
      { affectedAerodromes },
    );
  }
}
