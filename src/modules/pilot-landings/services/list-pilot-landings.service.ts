import { Injectable } from '@nestjs/common';

import type { Prisma } from '@/generated/prisma/client';
import { resolvePaginationParams } from '@/common/utils/pagination-params.util';

import { ListPilotLandingsQueryDTO } from '../dtos/list-pilot-landings-query.dto';
import { PilotLandingsPaginatedResponseDTO } from '../dtos/pilot-landings-paginated-response.dto';
import { PilotLandingMapper } from '../mappers/pilot-landing.mapper';
import { PilotLandingRepository } from '../repositories/pilot-landing.repository';

const MAX_LIMIT = 200;

@Injectable()
export class ListPilotLandingsService {
  constructor(private readonly repo: PilotLandingRepository) {}

  async execute(
    query: ListPilotLandingsQueryDTO,
  ): Promise<PilotLandingsPaginatedResponseDTO> {
    const { page, limit, skip } = resolvePaginationParams(query, MAX_LIMIT);

    const where: Prisma.PilotLandingWhereInput = {};
    if (query.operationalAerodromeId !== undefined) {
      where.operationalAerodromeId = query.operationalAerodromeId;
    }
    if (query.registration !== undefined && query.registration.length > 0) {
      where.registration = {
        contains: query.registration,
        mode: 'insensitive',
      };
    }

    const [items, total] = await Promise.all([
      this.repo.findMany(where, skip, limit),
      this.repo.count(where),
    ]);
    const data = PilotLandingMapper.toApiRows(items);
    return new PilotLandingsPaginatedResponseDTO(data, page, limit, total);
  }
}
