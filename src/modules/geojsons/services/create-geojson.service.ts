import { Injectable } from '@nestjs/common';

import { GeojsonResponseDTO } from '../dtos/geojson-response.dto';
import { CreateGeojsonDTO } from '../dtos/create-geojson.dto';
import { GeojsonMapper } from '../mappers/geojson.mapper';
import { buildGeojsonCreateInput } from '../mappers/geojson.prisma.mapper';
import { GeojsonRepository } from '../repositories/geojson.repository';

@Injectable()
export class CreateGeojsonService {
  constructor(private readonly repo: GeojsonRepository) {}

  async execute(dto: CreateGeojsonDTO): Promise<GeojsonResponseDTO> {
    const created = await this.repo.create(buildGeojsonCreateInput(dto));
    return GeojsonMapper.toApiRow(created);
  }
}
