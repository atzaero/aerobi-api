import type { Prisma, TechnicalVisit } from '@/generated/prisma/client';

import type { TechnicalVisitWithAerodrome } from '../types/technical-visit-with-aerodrome.type';

/** Referência mínima do aeródromo para o gate de escopo operacional no create. */
export interface AerodromeScopeRef {
  groupId: string;
}

/**
 * Linha mínima de visita para o dashboard: data (ms epoch) + as flags de inspeção
 * agregadas em não-conformidades. Só o subconjunto curado consumido pelo
 * dashboard (ver `non-conformity.util.ts`).
 */
export interface TechnicalVisitDashboardRow {
  visitAtMs: number;
  hasGatesPadlocks: boolean | null;
  hasFence: boolean | null;
  hasStandardPlate: boolean | null;
  hasQualityHoles: boolean | null;
  hasHorizontalSignage: boolean | null;
  hasUnobstructedHeadboards: boolean | null;
  pavementRegularity: boolean | null;
  hasTrashDebris: boolean | null;
  hasDelimitedPerimeter: boolean | null;
  hasInvasion: boolean | null;
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

  /**
   * Linhas mínimas para o dashboard (agregação em memória): filtradas por escopo
   * (`aerodromeIds` `null` = sem filtro; `[]` = nenhuma) e por `visitAt` no
   * intervalo `[fromMs, toMs]`.
   */
  findForDashboard(
    aerodromeIds: string[] | null,
    fromMs: number,
    toMs: number,
  ): Promise<TechnicalVisitDashboardRow[]>;

  /** Aeródromo (só `groupId`) para o gate de escopo do create; null se inexistente/soft-deletado. */
  findAerodromeGroupForScope(
    aerodromeId: string,
  ): Promise<AerodromeScopeRef | null>;

  /** Soft delete usando campos de auditoria deletedAt/deletedBy. */
  softDelete(id: string, deletedBy: string): Promise<TechnicalVisit>;
}
