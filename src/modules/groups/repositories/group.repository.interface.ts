import type { Prisma, Group } from '@/generated/prisma/client';

export interface IGroupRepository {
  create(data: Prisma.GroupCreateInput): Promise<Group>;

  update(id: string, data: Prisma.GroupUpdateInput): Promise<Group>;

  findById(id: string): Promise<Group | null>;

  findMany(
    where: Prisma.GroupWhereInput,
    skip: number,
    take: number,
  ): Promise<Group[]>;

  count(where: Prisma.GroupWhereInput): Promise<number>;

  /**
   * Soft delete (deletedAt/deletedBy) do grupo + cascata transacional: fecha os
   * aeródromos operacionais ativos do grupo. Devolve o grupo e a contagem de
   * aeródromos afetados.
   */
  softDeleteWithCascade(
    id: string,
    deletedBy: string,
  ): Promise<{ group: Group; affectedAerodromes: number }>;
}
