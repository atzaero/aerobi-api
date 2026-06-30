import type { Group } from '@/generated/prisma/client';
import { StorageService } from '@/modules/storage/services/storage.service';
import { resolveBestEffortPresignedUrl } from '@/modules/storage/utils/resolve-presigned-url';

import { GroupDeletionResponseDTO } from '../dtos/group-deletion-response.dto';
import { GroupResponseDTO } from '../dtos/group-response.dto';
import { GroupMapper } from '../mappers/group.mapper';

/**
 * Resolve a presigned URL (best-effort) da imagem do grupo e projeta a entidade
 * no DTO de resposta. Centraliza o "tail" antes repetido em todos os services.
 */
export async function toGroupApiRowWithImage(
  storage: StorageService,
  entity: Group,
): Promise<GroupResponseDTO> {
  const imageUrl = await resolveBestEffortPresignedUrl(
    storage,
    entity.imageKey,
  );
  return GroupMapper.toApiRow(entity, imageUrl);
}

/** Variante para o DELETE (inclui `affectedAerodromes`). */
export async function toGroupDeletionResultWithImage(
  storage: StorageService,
  entity: Group,
  affectedAerodromes: number,
): Promise<GroupDeletionResponseDTO> {
  const imageUrl = await resolveBestEffortPresignedUrl(
    storage,
    entity.imageKey,
  );
  return GroupMapper.toDeletionResult(entity, affectedAerodromes, imageUrl);
}
