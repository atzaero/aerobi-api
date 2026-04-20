import { Injectable, NotFoundException } from '@nestjs/common';

import { AerodromeGeojsonResponseDTO } from '../dtos/aerodrome-geojson-response.dto';
import { UpdateAerodromeGeojsonDTO } from '../dtos/update-aerodrome-geojson.dto';
import { AerodromeGeojsonMapper } from '../mappers/aerodrome-geojson.mapper';
import { AerodromeGeojsonRepository } from '../repositories/aerodrome-geojson.repository';

export type UpdateAerodromeGeojsonServiceInput = UpdateAerodromeGeojsonDTO & {
  id: string;
};

@Injectable()
export class UpdateAerodromeGeojsonService {
  constructor(private readonly repo: AerodromeGeojsonRepository) {}

  async execute(
    input: UpdateAerodromeGeojsonServiceInput,
  ): Promise<AerodromeGeojsonResponseDTO> {
    // TODO: implementar
    const { id, ...data } = input;
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new NotFoundException(`AerodromeGeojson ${id} not found`);
    }
    const updated = await this.repo.update(id, data as never);
    return AerodromeGeojsonMapper.toApiRow(updated);
  }
}
