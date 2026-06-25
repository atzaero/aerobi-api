import type { Prisma, AerodromeGroup } from '@/generated/prisma/client';

export interface IAerodromeGroupRepository {
  create(data: Prisma.AerodromeGroupCreateInput): Promise<AerodromeGroup>;

  update(
    id: string,
    data: Prisma.AerodromeGroupUpdateInput,
  ): Promise<AerodromeGroup>;

  findById(id: string): Promise<AerodromeGroup | null>;

  findMany(
    where: Prisma.AerodromeGroupWhereInput,
    skip: number,
    take: number,
  ): Promise<AerodromeGroup[]>;

  count(where: Prisma.AerodromeGroupWhereInput): Promise<number>;

  /**
   * Soft delete (deletedAt/deletedBy) do grupo + cascata transacional: fecha os
   * aeródromos operacionais ativos do grupo. Devolve o grupo e a contagem de
   * aeródromos afetados.
   */
  softDeleteWithCascade(
    id: string,
    deletedBy: string,
  ): Promise<{ group: AerodromeGroup; affectedAerodromes: number }>;
}
