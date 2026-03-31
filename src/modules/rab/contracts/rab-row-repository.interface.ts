import type { Prisma, RabRow } from '@/generated/prisma/client';

import type { RabCsvRow } from '../types/rab-csv-row.type';

export interface IRabRowRepository {
  upsertBatch(rows: RabCsvRow[]): Promise<void>;
  findMany(
    where: Prisma.RabRowWhereInput,
    skip: number,
    take: number,
  ): Promise<RabRow[]>;
  count(where: Prisma.RabRowWhereInput): Promise<number>;
}
