import type { Prisma } from '@/generated/prisma/client';

import { CreateGeojsonDTO } from '../dtos/create-geojson.dto';
import { UpdateGeojsonDTO } from '../dtos/update-geojson.dto';

export function buildGeojsonCreateInput(
  dto: CreateGeojsonDTO,
): Prisma.GeojsonCreateInput {
  const { aerodromeId, geoJson, ...rest } = dto;
  return {
    ...rest,
    ...(geoJson !== undefined
      ? { geoJson: geoJson as Prisma.InputJsonValue }
      : {}),
    aerodrome: {
      connect: { id: aerodromeId },
    },
  };
}

export function patchGeojsonToPrisma(
  dto: UpdateGeojsonDTO,
): Prisma.GeojsonUpdateInput {
  const data: Prisma.GeojsonUpdateInput = {};
  if (dto.kind !== undefined) data.kind = dto.kind;
  if (dto.status !== undefined) data.status = dto.status;
  if (dto.geoJson !== undefined) {
    data.geoJson = dto.geoJson as Prisma.InputJsonValue;
  }
  if (dto.geoJsonBytes !== undefined) data.geoJsonBytes = dto.geoJsonBytes;
  if (dto.featureCount !== undefined) data.featureCount = dto.featureCount;
  if (dto.mapFileType !== undefined) data.mapFileType = dto.mapFileType;
  if (dto.sourceStoragePath !== undefined) {
    data.sourceStoragePath = dto.sourceStoragePath;
  }
  if (dto.sourceUpdatedAt !== undefined) {
    data.sourceUpdatedAt = dto.sourceUpdatedAt;
  }
  if (dto.geoJsonStoragePath !== undefined) {
    data.geoJsonStoragePath = dto.geoJsonStoragePath;
  }
  if (dto.versionHash !== undefined) data.versionHash = dto.versionHash;
  if (dto.errorMessage !== undefined) data.errorMessage = dto.errorMessage;
  if (dto.processingMs !== undefined) data.processingMs = dto.processingMs;
  if (dto.sourceBytes !== undefined) data.sourceBytes = dto.sourceBytes;
  if (dto.kmlTextBytes !== undefined) data.kmlTextBytes = dto.kmlTextBytes;
  if (dto.zipBytes !== undefined) data.zipBytes = dto.zipBytes;
  if (dto.generatedAt !== undefined) data.generatedAt = dto.generatedAt;
  return data;
}
