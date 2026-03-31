import { Injectable } from '@nestjs/common';

import { resolvePaginationParams } from '@/common/utils/pagination-params.util';

import { RabRowsFindAllQueryDTO } from '../dtos/rab-rows-find-all-query.dto';
import { RabRowsPaginatedResponseDTO } from '../dtos/rab-rows-paginated-response.dto';
import { RabRowRepository } from '../repositories/rab-row.repository';
import { buildRabRowWhereFromQuery } from '../utils/rab-row-where.util';
import { AnacIndexService } from './anac-index.service';

/** Align with {@link BasePaginationQueryDTO} `@Max(200)` for RAB listing. */
const RAB_ROWS_MAX_LIMIT = 200;

@Injectable()
export class RabRowsService {
  constructor(
    private readonly rowRepo: RabRowRepository,
    private readonly anacIndex: AnacIndexService,
  ) {}

  async execute(
    query: RabRowsFindAllQueryDTO,
  ): Promise<RabRowsPaginatedResponseDTO> {
    const { page, limit, skip } = resolvePaginationParams(
      query,
      RAB_ROWS_MAX_LIMIT,
    );

    const resolvedPeriod: string =
      query.period !== undefined && query.period !== ''
        ? query.period
        : await this.anacIndex.execute();

    const where = buildRabRowWhereFromQuery(query, resolvedPeriod);

    const [items, total] = await Promise.all([
      this.rowRepo.findMany(where, skip, limit),
      this.rowRepo.count(where),
    ]);

    return new RabRowsPaginatedResponseDTO(items, page, limit, total);
  }
}
