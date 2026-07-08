import type { Prisma, TechnicalVisit } from '@/generated/prisma/client';

import type { TechnicalVisitWithAerodrome } from '../types/technical-visit-with-aerodrome.type';

export interface ITechnicalVisitRepository {
  create(
    data: Prisma.TechnicalVisitCreateInput,
  ): Promise<TechnicalVisitWithAerodrome>;

  update(
    id: string,
    data: Prisma.TechnicalVisitUpdateInput,
  ): Promise<TechnicalVisitWithAerodrome>;

  findById(id: string): Promise<TechnicalVisit | null>;

  findMany(
    where: Prisma.TechnicalVisitWhereInput,
    skip: number,
    take: number,
  ): Promise<TechnicalVisit[]>;

  count(where: Prisma.TechnicalVisitWhereInput): Promise<number>;

  /** Soft delete usando campos de auditoria deletedAt/deletedBy. */
  softDelete(id: string, deletedBy: string): Promise<TechnicalVisit>;
}
