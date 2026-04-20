import type { Prisma, OperationalAerodrome } from '@/generated/prisma/client';

export interface IOperationalAerodromeRepository {
  create(
    data: Prisma.OperationalAerodromeCreateInput,
  ): Promise<OperationalAerodrome>;

  update(
    id: string,
    data: Prisma.OperationalAerodromeUpdateInput,
  ): Promise<OperationalAerodrome>;

  findById(id: string): Promise<OperationalAerodrome | null>;

  findMany(
    where: Prisma.OperationalAerodromeWhereInput,
    skip: number,
    take: number,
  ): Promise<OperationalAerodrome[]>;

  count(where: Prisma.OperationalAerodromeWhereInput): Promise<number>;

  /** Soft delete usando campos de auditoria deletedAt/deletedBy. */
  softDelete(id: string, deletedBy: string): Promise<OperationalAerodrome>;
}
