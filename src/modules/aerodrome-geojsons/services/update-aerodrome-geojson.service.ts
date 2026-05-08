import { HttpStatus, Injectable } from '@nestjs/common';

import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { ErrorCode } from '@/common/enums/error-code.enum';
import type { Prisma } from '@/generated/prisma/client';

import { AerodromeGeojsonResponseDTO } from '../dtos/aerodrome-geojson-response.dto';
import { UpdateAerodromeGeojsonDTO } from '../dtos/update-aerodrome-geojson.dto';
import { AerodromeGeojsonMapper } from '../mappers/aerodrome-geojson.mapper';
import { AerodromeGeojsonRepository } from '../repositories/aerodrome-geojson.repository';

export type UpdateAerodromeGeojsonServiceInput = UpdateAerodromeGeojsonDTO & {
  id: string;
};

function patchToPrisma(
  dto: UpdateAerodromeGeojsonDTO,
): Prisma.AerodromeGeojsonUpdateInput {
  const data: Prisma.AerodromeGeojsonUpdateInput = {};
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

@Injectable()
export class UpdateAerodromeGeojsonService {
  constructor(
    private readonly repo: AerodromeGeojsonRepository,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(
    input: UpdateAerodromeGeojsonServiceInput,
  ): Promise<AerodromeGeojsonResponseDTO> {
    const { id, operationalAerodromeId, ...dto } = input;
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new CustomHttpException(
        this.errorMessageService.getMessage(ErrorCode.RESOURCE_NOT_FOUND, {
          RESOURCE: 'GeoJSON operacional',
          ID: id,
        }),
        HttpStatus.NOT_FOUND,
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }

    const patch = patchToPrisma(dto);
    if (operationalAerodromeId !== undefined) {
      patch.operationalAerodrome = {
        connect: { id: operationalAerodromeId },
      };
    }

    const updated = await this.repo.update(id, patch);
    return AerodromeGeojsonMapper.toApiRow(updated);
  }
}
