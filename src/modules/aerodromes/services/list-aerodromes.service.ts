import { Injectable } from '@nestjs/common';

import type { Prisma } from '@/generated/prisma/client';
import { resolvePaginationParams } from '@/common/utils/pagination-params.util';

import { ListAerodromesQueryDTO } from '../dtos/list-aerodromes-query.dto';
import { AerodromesPaginatedResponseDTO } from '../dtos/aerodromes-paginated-response.dto';
import { AerodromeMapper } from '../mappers/aerodrome.mapper';
import { AerodromeRepository } from '../repositories/aerodrome.repository';

const MAX_LIMIT = 200;

@Injectable()
export class ListAerodromesService {
  constructor(private readonly repo: AerodromeRepository) {}

  async execute(
    query: ListAerodromesQueryDTO,
  ): Promise<AerodromesPaginatedResponseDTO> {
    const { page, limit, skip } = resolvePaginationParams(query, MAX_LIMIT);
    const where: Prisma.AerodromeWhereInput = {};
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
    return new AerodromesPaginatedResponseDTO(
      AerodromeMapper.toApiRows(items),
      page,
      limit,
      total,
    );
  }
}
