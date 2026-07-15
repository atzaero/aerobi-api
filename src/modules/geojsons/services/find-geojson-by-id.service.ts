import { Injectable } from '@nestjs/common';

import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { resourceNotFound } from '@/common/utils/resource-not-found.util';

import { GeojsonResponseDTO } from '../dtos/geojson-response.dto';
import { GeojsonMapper } from '../mappers/geojson.mapper';
import { GeojsonRepository } from '../repositories/geojson.repository';

export type FindGeojsonByIdServiceInput = { id: string };

/**
 * Busca administrativa de um GeoJSON por id (response completo). 404 se
 * inexistente/soft-deletado; o escopo por grupo é garantido pelo
 * `GroupScopeGuard` (`GroupScopeSubject.GEOJSON`) no controller.
 */
@Injectable()
export class FindGeojsonByIdService {
  constructor(
    private readonly repo: GeojsonRepository,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(
    input: FindGeojsonByIdServiceInput,
  ): Promise<GeojsonResponseDTO> {
    const entity = await this.repo.findById(input.id);
    if (!entity) {
      throw resourceNotFound(
        this.errorMessageService,
        'GeoJSON operacional',
        input.id,
      );
    }
    return GeojsonMapper.toApiRow(entity);
  }
}
