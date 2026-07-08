import type { TechnicalVisitImage } from '@/generated/prisma/client';

import { TechnicalVisitImageResponseDTO } from '../dtos/technical-visit-image-response.dto';
import { resolveBestEffortPresignedUrl } from '@/modules/storage/utils/resolve-presigned-url';
import type { StorageService } from '@/modules/storage/services/storage.service';

export class TechnicalVisitImageMapper {
  static async toApiRow(
    storage: StorageService,
    entity: TechnicalVisitImage,
  ): Promise<TechnicalVisitImageResponseDTO> {
    const row = new TechnicalVisitImageResponseDTO();
    row.id = entity.id;
    row.technicalVisitId = entity.technicalVisitId;
    row.section = entity.section;
    row.imageUrl = await resolveBestEffortPresignedUrl(
      storage,
      entity.imageKey,
    );
    row.originalFilename = entity.originalFilename;
    row.mimeType = entity.mimeType;
    row.sizeBytes = entity.sizeBytes;
    row.uploadedBy = entity.uploadedBy;
    row.createdAt = entity.createdAt.toISOString();
    row.updatedAt = entity.updatedAt.toISOString();
    return row;
  }

  static async toApiRows(
    storage: StorageService,
    entities: TechnicalVisitImage[],
  ): Promise<TechnicalVisitImageResponseDTO[]> {
    return Promise.all(
      entities.map((entity) =>
        TechnicalVisitImageMapper.toApiRow(storage, entity),
      ),
    );
  }
}
