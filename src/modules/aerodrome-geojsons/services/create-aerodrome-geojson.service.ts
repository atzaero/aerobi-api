import { Injectable } from '@nestjs/common';

import type { Prisma } from '@/generated/prisma/client';

import { AerodromeGeojsonResponseDTO } from '../dtos/aerodrome-geojson-response.dto';
import { CreateAerodromeGeojsonDTO } from '../dtos/create-aerodrome-geojson.dto';
import { AerodromeGeojsonMapper } from '../mappers/aerodrome-geojson.mapper';
import { AerodromeGeojsonRepository } from '../repositories/aerodrome-geojson.repository';

@Injectable()
export class CreateAerodromeGeojsonService {
  constructor(private readonly repo: AerodromeGeojsonRepository) {}

  async execute(
    dto: CreateAerodromeGeojsonDTO,
  ): Promise<AerodromeGeojsonResponseDTO> {
    const { operationalAerodromeId, geoJson, ...rest } = dto;
    const data: Prisma.AerodromeGeojsonCreateInput = {
      ...rest,
      ...(geoJson !== undefined
        ? { geoJson: geoJson as Prisma.InputJsonValue }
        : {}),
      operationalAerodrome: {
        connect: { id: operationalAerodromeId },
      },
    };

    const created = await this.repo.create(data);
    return AerodromeGeojsonMapper.toApiRow(created);
  }
}
