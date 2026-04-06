import { Injectable } from '@nestjs/common';

import { resolvePaginationParams } from '@/common/utils/pagination-params.util';

import { PrivateAerodromesFindAllQueryDTO } from '../dtos/private-aerodromes-find-all-query.dto';
import { PrivateAerodromesPaginatedResponseDTO } from '../dtos/private-aerodromes-paginated-response.dto';
import { PrivateAerodromeRepository } from '../repositories/private-aerodrome.repository';
import { buildPrivateAerodromeWhereFromQuery } from '../utils/private-aerodrome-where.util';

const PRIVATE_AERODROMES_MAX_LIMIT = 200;

@Injectable()
export class PrivateAerodromesRowsService {
  constructor(private readonly repo: PrivateAerodromeRepository) {}

  async execute(
    query: PrivateAerodromesFindAllQueryDTO,
  ): Promise<PrivateAerodromesPaginatedResponseDTO> {
    const { page, limit, skip } = resolvePaginationParams(
      query,
      PRIVATE_AERODROMES_MAX_LIMIT,
    );

    const where = buildPrivateAerodromeWhereFromQuery(query);

    const [items, total] = await Promise.all([
      this.repo.findMany(where, skip, limit),
      this.repo.count(where),
    ]);

    return new PrivateAerodromesPaginatedResponseDTO(items, page, limit, total);
  }
}
