import { Injectable } from '@nestjs/common';

import { resolvePaginationParams } from '@/common/utils/pagination-params.util';
import { StorageService } from '@/modules/storage/services/storage.service';
import { resolveBestEffortPresignedUrl } from '@/modules/storage/utils/resolve-presigned-url';

import { MovementsPaginatedResponseDTO } from '../dtos/movements-paginated-response.dto';
import { ListMovementsQueryDTO } from '../dtos/list-movements-query.dto';
import { MovementListItemMapper } from '../mappers/movement-list-item.mapper';
import { MovementRepository } from '../repositories/movement.repository';
import { buildMovementsWhere } from '../utils/build-movements-where';

const MAX_LIMIT = 200;

@Injectable()
export class ListMovementsService {
  constructor(
    private readonly repo: MovementRepository,
    private readonly storage: StorageService,
  ) {}

  async execute(
    query: ListMovementsQueryDTO,
  ): Promise<MovementsPaginatedResponseDTO> {
    const { page, limit, skip } = resolvePaginationParams(query, MAX_LIMIT);
    const where = buildMovementsWhere(query);

    const [items, total] = await Promise.all([
      this.repo.findMany(where, skip, limit),
      this.repo.count(where),
    ]);

    const rows = await Promise.all(
      items.map(async (item) =>
        MovementListItemMapper.toListItem(
          item,
          await resolveBestEffortPresignedUrl(this.storage, item.imageKey),
        ),
      ),
    );

    return new MovementsPaginatedResponseDTO(rows, page, limit, total);
  }
}
