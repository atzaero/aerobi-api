import type { Prisma, Geojson } from '@/generated/prisma/client';

export interface IGeojsonRepository {
  create(data: Prisma.GeojsonCreateInput): Promise<Geojson>;

  update(id: string, data: Prisma.GeojsonUpdateInput): Promise<Geojson>;

  findById(id: string): Promise<Geojson | null>;

  findMany(
    where: Prisma.GeojsonWhereInput,
    skip: number,
    take: number,
  ): Promise<Geojson[]>;

  count(where: Prisma.GeojsonWhereInput): Promise<number>;

  /** Soft delete usando campos de auditoria deletedAt/deletedBy. */
  softDelete(id: string, deletedBy: string): Promise<Geojson>;
}
