import { Injectable } from '@nestjs/common';

import type { Prisma } from '@/generated/prisma/client';
import { resolvePaginationParams } from '@/common/utils/pagination-params.util';

import { ListAerodromeGeojsonsQueryDTO } from '../dtos/list-aerodrome-geojsons-query.dto';
import { AerodromeGeojsonsPaginatedResponseDTO } from '../dtos/aerodrome-geojsons-paginated-response.dto';
import { AerodromeGeojsonMapper } from '../mappers/aerodrome-geojson.mapper';
import { AerodromeGeojsonRepository } from '../repositories/aerodrome-geojson.repository';

const MAX_LIMIT = 200;

@Injectable()
export class ListAerodromeGeojsonsService {
  constructor(private readonly repo: AerodromeGeojsonRepository) {}

  async execute(
    query: ListAerodromeGeojsonsQueryDTO,
  ): Promise<AerodromeGeojsonsPaginatedResponseDTO> {
    const { page, limit, skip } = resolvePaginationParams(query, MAX_LIMIT);
    const where: Prisma.AerodromeGeojsonWhereInput = {};
    if (query.aerodromeId !== undefined) {
      where.aerodromeId = query.aerodromeId;
    }
    if (query.status !== undefined) {
      where.status = query.status;
    }
    const [items, total] = await Promise.all([
      this.repo.findMany(where, skip, limit),
      this.repo.count(where),
    ]);
    return new AerodromeGeojsonsPaginatedResponseDTO(
      AerodromeGeojsonMapper.toApiRows(items),
      page,
      limit,
      total,
    );
  }
}
