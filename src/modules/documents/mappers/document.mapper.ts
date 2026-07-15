import type { Document } from '@/generated/prisma/client';

import { DocumentResponseDTO } from '../dtos/document-response.dto';
import { toDocumentTypeApi } from '../utils/document-type';

/**
 * Projeta um documento no response da API. `type` sai em lowercase (paridade
 * web); a `url` presigned é **pré-resolvida** pelo service (best-effort) e
 * injetada aqui — o mapper permanece puro (sem I/O). Não expõe
 * `storageKey`/`deletedAt`/`deletedBy`.
 */
export class DocumentMapper {
  static toApiRow(entity: Document, url: string | null): DocumentResponseDTO {
    const row = new DocumentResponseDTO();
    row.id = entity.id;
    row.aerodromeId = entity.aerodromeId;
    row.uf = entity.uf;
    row.type = toDocumentTypeApi(entity.type);
    row.originalFilename = entity.originalFilename;
    row.mimeType = entity.mimeType;
    row.sizeBytes = entity.sizeBytes;
    row.url = url;
    row.uploadedBy = entity.uploadedBy;
    row.createdAt = entity.createdAt.toISOString();
    row.updatedAt = entity.updatedAt.toISOString();
    return row;
  }
}
