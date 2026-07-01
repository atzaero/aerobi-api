import { Injectable } from '@nestjs/common';

import type { Prisma } from '@/generated/prisma/client';
import { resolvePaginationParams } from '@/common/utils/pagination-params.util';

import { ListGeojsonsQueryDTO } from '../dtos/list-geojsons-query.dto';
import { GeojsonsPaginatedResponseDTO } from '../dtos/geojsons-paginated-response.dto';
import { GeojsonMapper } from '../mappers/geojson.mapper';
import { GeojsonRepository } from '../repositories/geojson.repository';

const MAX_LIMIT = 200;

@Injectable()
export class ListGeojsonsService {
  constructor(private readonly repo: GeojsonRepository) {}

  async execute(
    query: ListGeojsonsQueryDTO,
  ): Promise<GeojsonsPaginatedResponseDTO> {
    const { page, limit, skip } = resolvePaginationParams(query, MAX_LIMIT);
    const where: Prisma.GeojsonWhereInput = {};
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
    return new GeojsonsPaginatedResponseDTO(
      GeojsonMapper.toApiRows(items),
      page,
      limit,
      total,
    );
  }
}
