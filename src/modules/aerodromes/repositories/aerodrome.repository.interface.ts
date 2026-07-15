import type { Prisma } from '@/generated/prisma/client';

/**
 * Aeródromo já com a UF do grupo carregada. A UF **não** é coluna do aeródromo:
 * é derivada da relação `group.uf` (source-of-truth) e exposta no response.
 */
export type AerodromeWithGroup = Prisma.AerodromeGetPayload<{
  include: { group: { select: { uf: true } } };
}>;

/**
 * Aeródromo visível (mapa/ficha pública) com UF do grupo + GeoJSON ativo
 * (subset: status/kind/mapFileType/geoJson). O `where: { deletedAt: null }` no
 * include é só runtime — o `GetPayload` não expressa o filtro; GeoJSON
 * soft-deletado chega como `geojson: null` no campo aninhado.
 */
export type AerodromeVisibleWithGroup = Prisma.AerodromeGetPayload<{
  include: {
    group: { select: { uf: true } };
    geojson: {
      select: {
        status: true;
        kind: true;
        mapFileType: true;
        geoJson: true;
      };
    };
  };
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

  /**
   * Todos os aeródromos ativos com `isView=true` (mapa público). Sem paginação —
   * o cliente precisa de todos os marcadores de uma vez. Inclui GeoJSON ativo
   * (JSONB inline): o payload pode ser grande; preferir compressão HTTP (gzip)
   * no proxy e medir tamanho agregado em staging antes de produção.
   */
  findAllVisible(): Promise<AerodromeVisibleWithGroup[]>;

  /**
   * Aeródromo ativo e visível pelo ICAO (ficha pública). `null` se inexistente,
   * soft-deletado ou `isView !== true`. Inclui GeoJSON ativo.
   */
  findVisibleByIcao(icao: string): Promise<AerodromeVisibleWithGroup | null>;

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
