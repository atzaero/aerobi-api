import { randomUUID } from 'node:crypto';

import {
  StorageDomain,
  buildStorageKey,
  buildUuidLeaf,
  resolveKeyExtension,
} from '@/modules/storage/keys';

/**
 * Tamanho máximo da imagem (5 MB), espelhando o limite do `aerobi-web` para a
 * imagem do grupo (`movements` usa 10 MB; aqui é 5 por paridade com o web).
 */
export const MAX_GROUP_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

/**
 * Monta a key do objeto no MinIO no layout `groups/{groupId}/images/<uuid>.<ext>`.
 * Delega à gramática canônica (`buildStorageKey`, módulo `storage/keys`) — o
 * shape da key é preservado (zero migração).
 */
export function buildGroupImageKey(groupId: string, mimetype: string): string {
  return buildStorageKey({
    domain: StorageDomain.GROUPS,
    itemId: groupId,
    docType: 'images',
    leaf: buildUuidLeaf(randomUUID(), resolveKeyExtension({ mimetype })),
  });
}
