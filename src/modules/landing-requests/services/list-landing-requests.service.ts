import { Injectable } from '@nestjs/common';

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
    // TODO: construir filtros where a partir da query
    const where = {};
    const [items, total] = await Promise.all([
      this.repo.findMany(where, skip, limit),
      this.repo.count(where),
    ]);
    const data = LandingRequestMapper.toApiRows(items);
    return new LandingRequestsPaginatedResponseDTO(data, page, limit, total);
  }
}
