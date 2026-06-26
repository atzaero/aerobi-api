import type { AerodromeGroup } from '@/generated/prisma/client';
import { StorageService } from '@/modules/storage/services/storage.service';
import { resolveBestEffortPresignedUrl } from '@/modules/storage/utils/resolve-presigned-url';

import { AerodromeGroupDeletionResponseDTO } from '../dtos/aerodrome-group-deletion-response.dto';
import { AerodromeGroupResponseDTO } from '../dtos/aerodrome-group-response.dto';
import { AerodromeGroupMapper } from '../mappers/aerodrome-group.mapper';

/**
 * Resolve a presigned URL (best-effort) da imagem do grupo e projeta a entidade
 * no DTO de resposta. Centraliza o "tail" antes repetido em todos os services.
 */
export async function toAerodromeGroupApiRowWithImage(
  storage: StorageService,
  entity: AerodromeGroup,
): Promise<AerodromeGroupResponseDTO> {
  const imageUrl = await resolveBestEffortPresignedUrl(
    storage,
    entity.imageKey,
  );
  return AerodromeGroupMapper.toApiRow(entity, imageUrl);
}

/** Variante para o DELETE (inclui `affectedAerodromes`). */
export async function toAerodromeGroupDeletionResultWithImage(
  storage: StorageService,
  entity: AerodromeGroup,
  affectedAerodromes: number,
): Promise<AerodromeGroupDeletionResponseDTO> {
  const imageUrl = await resolveBestEffortPresignedUrl(
    storage,
    entity.imageKey,
  );
  return AerodromeGroupMapper.toDeletionResult(
    entity,
    affectedAerodromes,
    imageUrl,
  );
}
