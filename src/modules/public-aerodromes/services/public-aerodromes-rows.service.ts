import { Injectable } from '@nestjs/common';

import { resolvePaginationParams } from '@/common/utils/pagination-params.util';

import { PublicAerodromesFindAllQueryDTO } from '../dtos/public-aerodromes-find-all-query.dto';
import { PublicAerodromesPaginatedResponseDTO } from '../dtos/public-aerodromes-paginated-response.dto';
import { PublicAerodromeRepository } from '../repositories/public-aerodrome.repository';
import { buildPublicAerodromeWhereFromQuery } from '../utils/public-aerodrome-where.util';

const PUBLIC_AERODROMES_MAX_LIMIT = 200;

@Injectable()
export class PublicAerodromesRowsService {
  constructor(private readonly repo: PublicAerodromeRepository) {}

  async execute(
    query: PublicAerodromesFindAllQueryDTO,
  ): Promise<PublicAerodromesPaginatedResponseDTO> {
    const { page, limit, skip } = resolvePaginationParams(
      query,
      PUBLIC_AERODROMES_MAX_LIMIT,
    );

    const where = buildPublicAerodromeWhereFromQuery(query);

    const [items, total] = await Promise.all([
      this.repo.findMany(where, skip, limit),
      this.repo.count(where),
    ]);

    return new PublicAerodromesPaginatedResponseDTO(items, page, limit, total);
  }
}
