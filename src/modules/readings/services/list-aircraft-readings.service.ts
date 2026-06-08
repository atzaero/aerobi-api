import { Injectable } from '@nestjs/common';

import type { Prisma } from '@/generated/prisma/client';
import { resolvePaginationParams } from '@/common/utils/pagination-params.util';
import { StorageService } from '@/modules/storage/services/storage.service';

import { AircraftReadingsPaginatedResponseDTO } from '../dtos/aircraft-readings-paginated-response.dto';
import { ListAircraftReadingsQueryDTO } from '../dtos/list-aircraft-readings-query.dto';
import { AircraftReadingMapper } from '../mappers/aircraft-reading.mapper';
import { AircraftReadingRepository } from '../repositories/aircraft-reading.repository';
import { resolveReadingImageUrl } from '../utils/resolve-reading-image-url';

const MAX_LIMIT = 200;

@Injectable()
export class ListAircraftReadingsService {
  constructor(
    private readonly repo: AircraftReadingRepository,
    private readonly storage: StorageService,
  ) {}

  async execute(
    query: ListAircraftReadingsQueryDTO,
  ): Promise<AircraftReadingsPaginatedResponseDTO> {
    const { page, limit, skip } = resolvePaginationParams(query, MAX_LIMIT);
    const where = this.buildWhere(query);

    const [items, total] = await Promise.all([
      this.repo.findMany(where, skip, limit),
      this.repo.count(where),
    ]);

    const rows = await Promise.all(
      items.map(async (item) =>
        AircraftReadingMapper.toApiRow(
          item,
          await resolveReadingImageUrl(this.storage, item.imageKey),
        ),
      ),
    );

    return new AircraftReadingsPaginatedResponseDTO(rows, page, limit, total);
  }

  private buildWhere(
    query: ListAircraftReadingsQueryDTO,
  ): Prisma.AircraftReadingWhereInput {
    const where: Prisma.AircraftReadingWhereInput = {};
    if (query.registration) {
      where.registration = query.registration;
    }
    if (query.aerodrome) {
      where.aerodrome = query.aerodrome;
    }
    if (query.reading_status) {
      where.readingStatus = query.reading_status;
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
