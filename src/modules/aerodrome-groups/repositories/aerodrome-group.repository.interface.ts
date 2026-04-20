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

  /** Soft delete usando campos de auditoria deletedAt/deletedBy. */
  softDelete(id: string, deletedBy: string): Promise<AerodromeGroup>;
}
