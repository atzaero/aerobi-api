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

export interface FindVisibleGeojsonByAerodromeIdInput {
  aerodromeId: string;
}

/**
 * Leitura pública do GeoJSON por aeródromo visível (X-API-Key). Mesma ordem de
 * checagem do JWT `FindGeojsonForAerodromeService`, com filtro extra de
 * `isView=true` no repositório (oculto/inexistente → 404).
 */
@Injectable()
export class FindVisibleGeojsonByAerodromeIdService {
  constructor(
    private readonly repo: GeojsonRepository,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(
    input: FindVisibleGeojsonByAerodromeIdInput,
  ): Promise<GeojsonForAerodromeResponseDTO> {
    const entity = await this.repo.findActiveVisibleByAerodromeId(
      input.aerodromeId,
    );
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
