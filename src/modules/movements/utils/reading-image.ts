import { randomUUID } from 'node:crypto';

import {
  StorageDomain,
  buildStorageKey,
  buildUuidLeaf,
  resolveKeyExtension,
} from '@/modules/storage/keys';

export {
  ALLOWED_IMAGE_MIMETYPES,
  isAllowedImageMimetype,
} from '@/modules/storage/utils/image-mimetype';

/** Tamanho máximo da imagem (10 MB), espelhando o limite do aviascan-api legado. */
export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

/** Máximo de imagens por requisição de lote (`POST /readings/batch`). */
export const MAX_BATCH_FILES = 50;

/**
 * Monta a key da imagem do movimento no layout
 * `movements/{movementId}/image/<uuid>.<ext>` — espelhando o banco (a linha do
 * movimento é a dona da imagem). Delega à gramática canônica (`buildStorageKey`,
 * módulo storage/keys) em vez de montar a string à mão.
 */
export function buildMovementImageKey(
  movementId: string,
  mimetype: string,
): string {
  return buildStorageKey({
    domain: StorageDomain.MOVEMENTS,
    itemId: movementId,
    docType: 'image',
    leaf: buildUuidLeaf(randomUUID(), resolveKeyExtension({ mimetype })),
  });
}
