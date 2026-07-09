import type { Prisma } from '@/generated/prisma/client';

/**
 * Aeródromo já com a UF do grupo carregada. A UF **não** é coluna do aeródromo:
 * é derivada da relação `group.uf` (source-of-truth) e exposta no response.
 */
export type AerodromeWithGroup = Prisma.AerodromeGetPayload<{
  include: { group: { select: { uf: true } } };
}>;

/** Linha mínima do snapshot de aeródromos do dashboard (contagens por flag). */
export interface AerodromeDashboardSnapshotRow {
  isOpen: boolean;
  isView: boolean;
  construction: boolean | null;
  lit: boolean | null;
  fueling: boolean | null;
}

export interface IAerodromeRepository {
  create(data: Prisma.AerodromeCreateInput): Promise<AerodromeWithGroup>;

  update(
    id: string,
    data: Prisma.AerodromeUpdateInput,
  ): Promise<AerodromeWithGroup>;

  findById(id: string): Promise<AerodromeWithGroup | null>;

  findMany(
    where: Prisma.AerodromeWhereInput,
    skip: number,
    take: number,
  ): Promise<AerodromeWithGroup[]>;

  count(where: Prisma.AerodromeWhereInput): Promise<number>;

  /** Soft delete usando campos de auditoria deletedAt/deletedBy. */
  softDelete(id: string, deletedBy: string): Promise<AerodromeWithGroup>;

  /**
   * Grupo ativo (não removido) para validar o vínculo do aeródromo no
   * create/update. `null` quando inexistente ou soft-deletado.
   */
  findActiveGroup(groupId: string): Promise<{ id: string } | null>;

  /**
   * Snapshot (sem faixa de tempo) das flags dos aeródromos ativos no escopo
   * (`aerodromeIds` `null` = sem filtro; `[]` = nenhum), para as contagens do
   * dashboard.
   */
  findForDashboardSnapshot(
    aerodromeIds: string[] | null,
  ): Promise<AerodromeDashboardSnapshotRow[]>;

  /** IDs dos aeródromos ativos de um grupo — materializa o escopo do dashboard. */
  findActiveIdsByGroup(groupId: string): Promise<string[]>;
}
