import type { AerodromeGeojson } from '@/generated/prisma/client';

import { AerodromeGeojsonResponseDTO } from '../dtos/aerodrome-geojson-response.dto';

export class AerodromeGeojsonMapper {
  static toApiRow(entity: AerodromeGeojson): AerodromeGeojsonResponseDTO {
    const row = new AerodromeGeojsonResponseDTO();
    row.id = entity.id;
    row.operationalAerodromeId = entity.operationalAerodromeId;
    row.kind = entity.kind;
    row.status = entity.status;
    row.geoJson = entity.geoJson;
    row.geoJsonBytes = entity.geoJsonBytes;
    row.featureCount = entity.featureCount;
    row.mapFileType = entity.mapFileType;
    row.sourceStoragePath = entity.sourceStoragePath;
    row.sourceUpdatedAt = entity.sourceUpdatedAt;
    row.geoJsonStoragePath = entity.geoJsonStoragePath;
    row.versionHash = entity.versionHash;
    row.errorMessage = entity.errorMessage;
    row.processingMs = entity.processingMs;
    row.sourceBytes = entity.sourceBytes;
    row.kmlTextBytes = entity.kmlTextBytes;
    row.zipBytes = entity.zipBytes;
    row.generatedAt = entity.generatedAt
      ? entity.generatedAt.toISOString()
      : null;
    row.createdAt = entity.createdAt.toISOString();
    row.createdBy = entity.createdBy;
    row.updatedAt = entity.updatedAt.toISOString();
    row.updatedBy = entity.updatedBy;
    row.deletedAt = entity.deletedAt ? entity.deletedAt.toISOString() : null;
    row.deletedBy = entity.deletedBy;
    return row;
  }

  static toApiRows(
    entities: AerodromeGeojson[],
  ): AerodromeGeojsonResponseDTO[] {
    return entities.map((e) => AerodromeGeojsonMapper.toApiRow(e));
  }
}
