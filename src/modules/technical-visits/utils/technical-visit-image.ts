import { randomUUID } from 'node:crypto';

import {
  StorageDomain,
  buildStorageKey,
  buildUuidLeaf,
  resolveKeyExtension,
} from '@/modules/storage/keys';
import type { TechnicalVisitImageSection } from '@/generated/prisma/client';

export {
  ALLOWED_IMAGE_MIMETYPES,
  isAllowedImageMimetype,
  detectImageMimetype,
} from '@/modules/groups/utils/group-image';

/** Tamanho máximo da imagem (5 MB), paridade com `add/action.ts` do web. */
export const MAX_TECHNICAL_VISIT_IMAGE_BYTES = 5 * 1024 * 1024;

/**
 * Monta a key `technical-visits/{visitId}/{section}/{uuid}.<ext>` — gramática
 * canônica do módulo `storage` (#369).
 */
export function buildTechnicalVisitImageKey(
  visitId: string,
  section: TechnicalVisitImageSection,
  mimetype: string,
): string {
  return buildStorageKey({
    domain: StorageDomain.TECHNICAL_VISITS,
    itemId: visitId,
    docType: section,
    leaf: buildUuidLeaf(randomUUID(), resolveKeyExtension({ mimetype })),
  });
}
