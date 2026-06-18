import { Injectable } from '@nestjs/common';

import type { Prisma } from '@/generated/prisma/client';
import { resolvePaginationParams } from '@/common/utils/pagination-params.util';
import { normalizeMarcas } from '@/modules/rab/utils/normalize-marcas';
import { StorageService } from '@/modules/storage/services/storage.service';

import { MovementsPaginatedResponseDTO } from '../dtos/movements-paginated-response.dto';
import { ListMovementsQueryDTO } from '../dtos/list-movements-query.dto';
import { MovementListItemMapper } from '../mappers/movement-list-item.mapper';
import { MovementRepository } from '../repositories/movement.repository';
import { resolveReadingImageUrl } from '../utils/resolve-reading-image-url';

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
    const where = this.buildWhere(query);

    const [items, total] = await Promise.all([
      this.repo.findMany(where, skip, limit),
      this.repo.count(where),
    ]);

    const rows = await Promise.all(
      items.map(async (item) =>
        MovementListItemMapper.toListItem(
          item,
          await resolveReadingImageUrl(this.storage, item.imageKey),
        ),
      ),
    );

    return new MovementsPaginatedResponseDTO(rows, page, limit, total);
  }

  private buildWhere(query: ListMovementsQueryDTO): Prisma.MovementWhereInput {
    const where: Prisma.MovementWhereInput = {};
    if (query.registration) {
      /**
       * `registration` é persistido na forma canônica (sem hífen); normaliza o
       * filtro para casar independentemente do formato digitado ("PR-ZTT").
       */
      where.registration = normalizeMarcas(query.registration);
    }
    if (query.aerodrome) {
      where.aerodrome = query.aerodrome;
    }
    if (query.reading_status) {
      where.readingStatus = query.reading_status;
    }
    if (query.operation_type) {
      where.operationType = query.operation_type;
    }
    if (query.source) {
      where.source = query.source;
    }
    if (query.start_date || query.end_date) {
      const readingDatetime: Prisma.DateTimeFilter = {};
      if (query.start_date) {
        readingDatetime.gte = new Date(`${query.start_date}T00:00:00.000Z`);
      }
      if (query.end_date) {
        readingDatetime.lte = new Date(`${query.end_date}T23:59:59.999Z`);
      }
      where.readingDatetime = readingDatetime;
    }
    return where;
  }
}
