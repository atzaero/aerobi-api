import { Injectable, NotFoundException } from '@nestjs/common';

import { AerodromeGeojsonResponseDTO } from '../dtos/aerodrome-geojson-response.dto';
import { AerodromeGeojsonMapper } from '../mappers/aerodrome-geojson.mapper';
import { AerodromeGeojsonRepository } from '../repositories/aerodrome-geojson.repository';

export type RemoveAerodromeGeojsonServiceInput = {
  id: string;
  deletedBy: string;
};

@Injectable()
export class RemoveAerodromeGeojsonService {
  constructor(private readonly repo: AerodromeGeojsonRepository) {}

  async execute(
    input: RemoveAerodromeGeojsonServiceInput,
  ): Promise<AerodromeGeojsonResponseDTO> {
    // TODO: implementar (soft delete)
    const existing = await this.repo.findById(input.id);
    if (!existing) {
      throw new NotFoundException(`AerodromeGeojson ${input.id} not found`);
    }
    const deleted = await this.repo.softDelete(input.id, input.deletedBy);
    return AerodromeGeojsonMapper.toApiRow(deleted);
  }
}
