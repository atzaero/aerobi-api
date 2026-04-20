import { Injectable } from '@nestjs/common';

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
    // TODO: construir filtros where a partir da query
    const where = {};
    const [items, total] = await Promise.all([
      this.repo.findMany(where, skip, limit),
      this.repo.count(where),
    ]);
    const data = AerodromeGeojsonMapper.toApiRows(items);
    return new AerodromeGeojsonsPaginatedResponseDTO(data, page, limit, total);
  }
}
