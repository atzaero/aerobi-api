import { HttpStatus, Injectable } from '@nestjs/common';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { httpError } from '@/common/exceptions/http-error.util';
import { resourceNotFound } from '@/common/utils/resource-not-found.util';
import { GeojsonStatus } from '@/generated/prisma/client';

import { GeojsonForAerodromeResponseDTO } from '../dtos/geojson-for-aerodrome-response.dto';
import { GeojsonForAerodromeMapper } from '../mappers/geojson-for-aerodrome.mapper';
import { GeojsonRepository } from '../repositories/geojson.repository';
import { parseGeoJsonField } from '../utils/geojson-content';

export interface FindGeojsonForAerodromeInput {
  aerodromeId: string;
}

/**
 * Leitura do GeoJSON por aeródromo — paridade célula-a-célula com
 * `getGeojsonForAerodrome` do web, na mesma ordem de checagem:
 *
 *  1. inexistente/soft-deletado → **404** (`RESOURCE_NOT_FOUND`);
 *  2. `status ≠ READY` → **422** (`GEOJSON_NOT_READY`);
 *  3. `geoJson` ausente/inválido → **502** (`GEOJSON_READ_FAILED`).
 *
 * O escopo por grupo do aeródromo é garantido pelo `GroupScopeGuard`
 * (`GroupScopeSubject.AERODROME`) no controller.
 */
@Injectable()
export class FindGeojsonForAerodromeService {
  constructor(
    private readonly repo: GeojsonRepository,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(
    input: FindGeojsonForAerodromeInput,
  ): Promise<GeojsonForAerodromeResponseDTO> {
    const entity = await this.repo.findActiveByAerodromeId(input.aerodromeId);
    if (!entity) {
      throw resourceNotFound(
        this.errorMessageService,
        'GeoJSON do aeródromo',
        input.aerodromeId,
      );
    }

    if (entity.status !== GeojsonStatus.READY) {
      throw httpError(
        this.errorMessageService,
        ErrorCode.GEOJSON_NOT_READY,
        HttpStatus.UNPROCESSABLE_ENTITY,
        { ID: input.aerodromeId, STATUS: entity.status },
      );
    }

    const geoJson = parseGeoJsonField(entity.geoJson);
    if (!geoJson) {
      throw httpError(
        this.errorMessageService,
        ErrorCode.GEOJSON_READ_FAILED,
        HttpStatus.BAD_GATEWAY,
        { ID: input.aerodromeId },
      );
    }

    return GeojsonForAerodromeMapper.toResponse(entity, geoJson);
  }
}
