import type { Document, DocumentType } from '@/generated/prisma/client';

/**
 * Recorte estável de um documento para os snapshots `before`/`after` da
 * auditoria. Projeta só identificadores/estado — **nunca** a `storageKey`, o nome
 * do arquivo ou dados voláteis (URL presigned). Segue o padrão de
 * `landingRequestAuditSnapshot`.
 */
export function documentAuditSnapshot(entity: Document): {
  id: string;
  aerodromeId: string;
  type: DocumentType;
} {
  return {
    id: entity.id,
    aerodromeId: entity.aerodromeId,
    type: entity.type,
  };
}
