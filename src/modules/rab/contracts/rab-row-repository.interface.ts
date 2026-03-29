import type { RabRow } from '@/generated/prisma/client';

import type { RabCsvRow } from '../types/rab-csv-row.type';

export interface IRabRowRepository {
  upsertBatch(rows: RabCsvRow[]): Promise<void>;
  findManyByPeriod(
    period: string,
    skip: number,
    take: number,
  ): Promise<RabRow[]>;
  countByPeriod(period: string): Promise<number>;
}
