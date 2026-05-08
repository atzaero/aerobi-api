import { Injectable } from '@nestjs/common';

import type { Prisma } from '@/generated/prisma/client';
import { resolvePaginationParams } from '@/common/utils/pagination-params.util';

import { ListAerodromeFeedbacksQueryDTO } from '../dtos/list-aerodrome-feedbacks-query.dto';
import { AerodromeFeedbacksPaginatedResponseDTO } from '../dtos/aerodrome-feedbacks-paginated-response.dto';
import { AerodromeFeedbackMapper } from '../mappers/aerodrome-feedback.mapper';
import { AerodromeFeedbackRepository } from '../repositories/aerodrome-feedback.repository';

const MAX_LIMIT = 200;

@Injectable()
export class ListAerodromeFeedbacksService {
  constructor(private readonly repo: AerodromeFeedbackRepository) {}

  async execute(
    query: ListAerodromeFeedbacksQueryDTO,
  ): Promise<AerodromeFeedbacksPaginatedResponseDTO> {
    const { page, limit, skip } = resolvePaginationParams(query, MAX_LIMIT);
    const where: Prisma.AerodromeFeedbackWhereInput = {};
    if (query.operationalAerodromeId !== undefined) {
      where.operationalAerodromeId = query.operationalAerodromeId;
    }
    if (query.rating !== undefined) {
      where.rating = query.rating;
    }
    const [items, total] = await Promise.all([
      this.repo.findMany(where, skip, limit),
      this.repo.count(where),
    ]);
    return new AerodromeFeedbacksPaginatedResponseDTO(
      AerodromeFeedbackMapper.toApiRows(items),
      page,
      limit,
      total,
    );
  }
}
