import { Injectable } from '@nestjs/common';

import type { Prisma } from '@/generated/prisma/client';
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
    const where: Prisma.OperationalAerodromeWhereInput = {};
    if (query.groupId !== undefined) {
      where.groupId = query.groupId;
    }
    if (query.icao !== undefined && query.icao.length > 0) {
      where.icao = { contains: query.icao, mode: 'insensitive' };
    }
    if (query.isView !== undefined) {
      where.isView = query.isView;
    }

    const [items, total] = await Promise.all([
      this.repo.findMany(where, skip, limit),
      this.repo.count(where),
    ]);
    return new OperationalAerodromesPaginatedResponseDTO(
      OperationalAerodromeMapper.toApiRows(items),
      page,
      limit,
      total,
    );
  }
}
