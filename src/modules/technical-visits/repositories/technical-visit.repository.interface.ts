import type { Prisma, TechnicalVisit } from '@/generated/prisma/client';

export interface ITechnicalVisitRepository {
  create(data: Prisma.TechnicalVisitCreateInput): Promise<TechnicalVisit>;

  update(
    id: string,
    data: Prisma.TechnicalVisitUpdateInput,
  ): Promise<TechnicalVisit>;

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
