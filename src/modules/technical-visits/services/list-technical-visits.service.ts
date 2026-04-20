import { Injectable } from '@nestjs/common';

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
    // TODO: construir filtros where a partir da query
    const where = {};
    const [items, total] = await Promise.all([
      this.repo.findMany(where, skip, limit),
      this.repo.count(where),
    ]);
    const data = TechnicalVisitMapper.toApiRows(items);
    return new TechnicalVisitsPaginatedResponseDTO(data, page, limit, total);
  }
}
