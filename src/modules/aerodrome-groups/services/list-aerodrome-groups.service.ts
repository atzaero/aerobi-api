import { Injectable } from '@nestjs/common';

import { resolvePaginationParams } from '@/common/utils/pagination-params.util';

import { ListAerodromeGroupsQueryDTO } from '../dtos/list-aerodrome-groups-query.dto';
import { AerodromeGroupsPaginatedResponseDTO } from '../dtos/aerodrome-groups-paginated-response.dto';
import { AerodromeGroupMapper } from '../mappers/aerodrome-group.mapper';
import { AerodromeGroupRepository } from '../repositories/aerodrome-group.repository';

const MAX_LIMIT = 200;

@Injectable()
export class ListAerodromeGroupsService {
  constructor(private readonly repo: AerodromeGroupRepository) {}

  async execute(
    query: ListAerodromeGroupsQueryDTO,
  ): Promise<AerodromeGroupsPaginatedResponseDTO> {
    const { page, limit, skip } = resolvePaginationParams(query, MAX_LIMIT);
    // TODO: construir filtros where a partir da query
    const where = {};
    const [items, total] = await Promise.all([
      this.repo.findMany(where, skip, limit),
      this.repo.count(where),
    ]);
    const data = AerodromeGroupMapper.toApiRows(items);
    return new AerodromeGroupsPaginatedResponseDTO(data, page, limit, total);
  }
}
