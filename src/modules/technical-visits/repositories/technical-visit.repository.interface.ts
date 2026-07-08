import type { Prisma, TechnicalVisit } from '@/generated/prisma/client';

import type { TechnicalVisitWithAerodrome } from '../types/technical-visit-with-aerodrome.type';

/** Referência mínima do aeródromo para o gate de escopo operacional no create. */
export interface AerodromeScopeRef {
  groupId: string;
}

export interface ITechnicalVisitRepository {
  create(
    data: Prisma.TechnicalVisitCreateInput,
  ): Promise<TechnicalVisitWithAerodrome>;

  update(
    id: string,
    data: Prisma.TechnicalVisitUpdateInput,
  ): Promise<TechnicalVisitWithAerodrome>;

  findById(id: string): Promise<TechnicalVisit | null>;

  findByIdWithAerodrome(
    id: string,
  ): Promise<TechnicalVisitWithAerodrome | null>;

  findMany(
    where: Prisma.TechnicalVisitWhereInput,
    skip: number,
    take: number,
  ): Promise<TechnicalVisitWithAerodrome[]>;

  count(where: Prisma.TechnicalVisitWhereInput): Promise<number>;

  /** Aeródromo (só `groupId`) para o gate de escopo do create; null se inexistente/soft-deletado. */
  findAerodromeGroupForScope(
    aerodromeId: string,
  ): Promise<AerodromeScopeRef | null>;

  /** Soft delete usando campos de auditoria deletedAt/deletedBy. */
  softDelete(id: string, deletedBy: string): Promise<TechnicalVisit>;
}
