import { randomUUID } from 'node:crypto';

import { DocumentType } from '@/generated/prisma/client';
import {
  StorageDomain,
  buildStorageKey,
  buildUniqueLeaf,
} from '@/modules/storage/keys';

/** Tamanho máximo de um documento (10 MB), espelhando o web (`MAX_DOCUMENT_BYTES`). */
export const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;

/**
 * Monta a key do documento no storage: `aerodromes/{aerodromeId}/{docType}/
 * {uuid}-{slug}`. O domínio é `aerodromes` (a tabela dona é o aeródromo) e o
 * `docType` é o tipo em lowercase (bate com `STORAGE_DOC_TYPES[aerodromes]`). O
 * leaf é **sempre único** (uuid) — nunca sobrescreve; o nome original vai em
 * coluna de metadado. Espelha `buildMultipleDocumentLeaf` do web (usado nos dois
 * writers).
 */
export function buildDocumentStorageKey(
  aerodromeId: string,
  type: DocumentType,
  originalFilename: string,
): string {
  return buildStorageKey({
    domain: StorageDomain.AERODROMES,
    itemId: aerodromeId,
    docType: type.toLowerCase(),
    leaf: buildUniqueLeaf(randomUUID(), originalFilename),
  });
}
