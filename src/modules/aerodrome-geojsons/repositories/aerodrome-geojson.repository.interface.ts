import type { Prisma, AerodromeGeojson } from '@/generated/prisma/client';

export interface IAerodromeGeojsonRepository {
  create(data: Prisma.AerodromeGeojsonCreateInput): Promise<AerodromeGeojson>;

  update(
    id: string,
    data: Prisma.AerodromeGeojsonUpdateInput,
  ): Promise<AerodromeGeojson>;

  findById(id: string): Promise<AerodromeGeojson | null>;

  findMany(
    where: Prisma.AerodromeGeojsonWhereInput,
    skip: number,
    take: number,
  ): Promise<AerodromeGeojson[]>;

  count(where: Prisma.AerodromeGeojsonWhereInput): Promise<number>;

  /** Soft delete usando campos de auditoria deletedAt/deletedBy. */
  softDelete(id: string, deletedBy: string): Promise<AerodromeGeojson>;
}
