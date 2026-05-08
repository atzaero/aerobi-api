import { Injectable } from '@nestjs/common';

import { AerodromeGeojsonResponseDTO } from '../dtos/aerodrome-geojson-response.dto';
import { CreateAerodromeGeojsonDTO } from '../dtos/create-aerodrome-geojson.dto';
import { AerodromeGeojsonMapper } from '../mappers/aerodrome-geojson.mapper';
import { buildAerodromeGeojsonCreateInput } from '../mappers/aerodrome-geojson.prisma.mapper';
import { AerodromeGeojsonRepository } from '../repositories/aerodrome-geojson.repository';

@Injectable()
export class CreateAerodromeGeojsonService {
  constructor(private readonly repo: AerodromeGeojsonRepository) {}

  async execute(
    dto: CreateAerodromeGeojsonDTO,
  ): Promise<AerodromeGeojsonResponseDTO> {
    const created = await this.repo.create(
      buildAerodromeGeojsonCreateInput(dto),
    );
    return AerodromeGeojsonMapper.toApiRow(created);
  }
}
