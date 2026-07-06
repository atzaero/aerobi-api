import type { DocumentType, Prisma, Uf } from '@/generated/prisma/client';

/** Dados montados no service para persistir um documento (create). */
export interface DocumentCreateData {
  aerodromeId: string;
  uf: Uf;
  type: DocumentType;
  storageKey: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  actorId: string;
}

/**
 * Monta o `create` input do Prisma para um documento. `uploadedBy`/`createdBy`/
 * `updatedBy` recebem o ator real. Builder puro (a persistência fica no repo).
 */
export function buildDocumentCreateInput(
  data: DocumentCreateData,
): Prisma.DocumentCreateInput {
  return {
    aerodrome: { connect: { id: data.aerodromeId } },
    uf: data.uf,
    type: data.type,
    storageKey: data.storageKey,
    originalFilename: data.originalFilename,
    mimeType: data.mimeType,
    sizeBytes: data.sizeBytes,
    uploadedBy: data.actorId,
    createdBy: data.actorId,
    updatedBy: data.actorId,
  };
}
