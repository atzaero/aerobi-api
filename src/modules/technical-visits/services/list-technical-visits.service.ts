import { Injectable } from '@nestjs/common';

import type { Prisma } from '@/generated/prisma/client';
import { resolvePaginationParams } from '@/common/utils/pagination-params.util';

import { ListTechnicalVisitsQueryDTO } from '../dtos/list-technical-visits-query.dto';
import { TechnicalVisitsPaginatedResponseDTO } from '../dtos/technical-visits-paginated-response.dto';
import { TechnicalVisitMapper } from '../mappers/technical-visit.mapper';
import { TechnicalVisitRepository } from '../repositories/technical-visit.repository';

const MAX_LIMIT = 200;

@Injectable()
export class ListTechnicalVisitsService {
  constructor(private readonly repo: TechnicalVisitRepository) {}

  async execute(
    query: ListTechnicalVisitsQueryDTO,
  ): Promise<TechnicalVisitsPaginatedResponseDTO> {
    const { page, limit, skip } = resolvePaginationParams(query, MAX_LIMIT);
    const where: Prisma.TechnicalVisitWhereInput = {};
    if (query.operationalAerodromeId !== undefined) {
      where.operationalAerodromeId = query.operationalAerodromeId;
    }
    const [items, total] = await Promise.all([
      this.repo.findMany(where, skip, limit),
      this.repo.count(where),
    ]);
    const data = TechnicalVisitMapper.toApiRows(items);
    return new TechnicalVisitsPaginatedResponseDTO(data, page, limit, total);
  }
}
