import { Injectable } from '@nestjs/common';

import { resolvePaginationParams } from '@/common/utils/pagination-params.util';

import { ListOperationalAerodromesQueryDTO } from '../dtos/list-operational-aerodromes-query.dto';
import { OperationalAerodromesPaginatedResponseDTO } from '../dtos/operational-aerodromes-paginated-response.dto';
import { OperationalAerodromeMapper } from '../mappers/operational-aerodrome.mapper';
import { OperationalAerodromeRepository } from '../repositories/operational-aerodrome.repository';

const MAX_LIMIT = 200;

@Injectable()
export class ListOperationalAerodromesService {
  constructor(private readonly repo: OperationalAerodromeRepository) {}

  async execute(
    query: ListOperationalAerodromesQueryDTO,
  ): Promise<OperationalAerodromesPaginatedResponseDTO> {
    const { page, limit, skip } = resolvePaginationParams(query, MAX_LIMIT);
    // TODO: construir filtros where a partir da query
    const where = {};
    const [items, total] = await Promise.all([
      this.repo.findMany(where, skip, limit),
      this.repo.count(where),
    ]);
    const data = OperationalAerodromeMapper.toApiRows(items);
    return new OperationalAerodromesPaginatedResponseDTO(
      data,
      page,
      limit,
      total,
    );
  }
}
