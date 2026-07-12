import type { Prisma, Geojson } from '@/generated/prisma/client';

/**
 * GeoJSON com os campos do aeródromo pai necessários para o response de leitura
 * por aeródromo (`icao`/`groupId` do aeródromo, `uf` do grupo). Derivados via
 * `include` — o model `Geojson` não os desnormaliza.
 */
export type GeojsonWithAerodrome = Prisma.GeojsonGetPayload<{
  include: {
    aerodrome: {
      select: {
        icao: true;
        groupId: true;
        group: { select: { uf: true } };
      };
    };
  };
}>;

export interface IGeojsonRepository {
  findById(id: string): Promise<Geojson | null>;

  findMany(
    where: Prisma.GeojsonWhereInput,
    skip: number,
    take: number,
  ): Promise<Geojson[]>;

  count(where: Prisma.GeojsonWhereInput): Promise<number>;

  /** Soft delete usando campos de auditoria deletedAt/deletedBy. */
  softDelete(id: string, deletedBy: string): Promise<Geojson>;

  /**
   * GeoJSON **ativo** de um aeródromo (deletedAt: null) com os campos do
   * aeródromo/grupo para o response de leitura. Usado por
   * `GET /geojsons/aerodrome/:id`.
   */
  findActiveByAerodromeId(
    aerodromeId: string,
  ): Promise<GeojsonWithAerodrome | null>;

  /**
   * Lista pública do mapa: GeoJSON ativo + `status: READY` cujo aeródromo pai
   * tem `isView=true` e não está soft-deletado. Sem paginação.
   * Usado por `GET /geojsons/visible`.
   */
  findAllActiveVisible(): Promise<GeojsonWithAerodrome[]>;

  /**
   * GeoJSON ativo de um aeródromo **visível** (`isView=true`, pai não
   * soft-deletado). Retorna **qualquer `status`** — o service valida READY e
   * lança 422 se necessário (não colapsar em 404). Usado por
   * `GET /geojsons/visible/:aerodromeId`.
   */
  findActiveVisibleByAerodromeId(
    aerodromeId: string,
  ): Promise<GeojsonWithAerodrome | null>;

  /**
   * GeoJSON de um aeródromo em **qualquer estado** (inclusive soft-deletado) —
   * base do snapshot `before` e da decisão CREATE/UPDATE do upsert de geração.
   */
  findByAerodromeIdAnyState(aerodromeId: string): Promise<Geojson | null>;

  /** Existência de aeródromo ativo (skip da geração). */
  aerodromeExists(aerodromeId: string): Promise<boolean>;

  /**
   * Upsert determinístico por `aerodromeId` (1:1). Enxerga registros
   * soft-deletados para reusá-los (o `update` re-ativa via deletedAt/deletedBy
   * nulos).
   */
  upsertByAerodromeId(
    aerodromeId: string,
    create: Prisma.GeojsonCreateInput,
    update: Prisma.GeojsonUpdateInput,
  ): Promise<Geojson>;
}
