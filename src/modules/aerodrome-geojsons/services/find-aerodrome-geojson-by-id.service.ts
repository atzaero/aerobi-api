import { Injectable, NotFoundException } from '@nestjs/common';

import { AerodromeGeojsonResponseDTO } from '../dtos/aerodrome-geojson-response.dto';
import { AerodromeGeojsonMapper } from '../mappers/aerodrome-geojson.mapper';
import { AerodromeGeojsonRepository } from '../repositories/aerodrome-geojson.repository';

export type FindAerodromeGeojsonByIdServiceInput = { id: string };

@Injectable()
export class FindAerodromeGeojsonByIdService {
  constructor(private readonly repo: AerodromeGeojsonRepository) {}

  async execute(
    input: FindAerodromeGeojsonByIdServiceInput,
  ): Promise<AerodromeGeojsonResponseDTO> {
    // TODO: implementar
    const entity = await this.repo.findById(input.id);
    if (!entity) {
      throw new NotFoundException(`AerodromeGeojson ${input.id} not found`);
    }
    return AerodromeGeojsonMapper.toApiRow(entity);
  }
}
