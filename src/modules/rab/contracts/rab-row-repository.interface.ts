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
  /**
   * `marcas` deve chegar na **forma canônica** do banco (sem hífen/espaços,
   * maiúsculas — ver `normalizeMarcas`); a normalização do input é
   * responsabilidade do chamador (camada de service).
   */
  findLatestByMarcas(marcas: string): Promise<RabRow | null>;
}
