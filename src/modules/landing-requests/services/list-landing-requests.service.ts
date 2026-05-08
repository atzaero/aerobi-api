import { Injectable } from '@nestjs/common';

import type { Prisma } from '@/generated/prisma/client';
import { resolvePaginationParams } from '@/common/utils/pagination-params.util';

import { ListLandingRequestsQueryDTO } from '../dtos/list-landing-requests-query.dto';
import { LandingRequestsPaginatedResponseDTO } from '../dtos/landing-requests-paginated-response.dto';
import { LandingRequestMapper } from '../mappers/landing-request.mapper';
import { LandingRequestRepository } from '../repositories/landing-request.repository';

const MAX_LIMIT = 200;

@Injectable()
export class ListLandingRequestsService {
  constructor(private readonly repo: LandingRequestRepository) {}

  async execute(
    query: ListLandingRequestsQueryDTO,
  ): Promise<LandingRequestsPaginatedResponseDTO> {
    const { page, limit, skip } = resolvePaginationParams(query, MAX_LIMIT);
    const where: Prisma.LandingRequestWhereInput = {};
    if (query.operationalAerodromeId !== undefined) {
      where.operationalAerodromeId = query.operationalAerodromeId;
    }
    if (query.status !== undefined) {
      where.status = query.status;
    }
    const [items, total] = await Promise.all([
      this.repo.findMany(where, skip, limit),
      this.repo.count(where),
    ]);
    return new LandingRequestsPaginatedResponseDTO(
      LandingRequestMapper.toApiRows(items),
      page,
      limit,
      total,
    );
  }
}
