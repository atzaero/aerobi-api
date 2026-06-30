import type { Prisma, Aerodrome } from '@/generated/prisma/client';

export interface IAerodromeRepository {
  create(data: Prisma.AerodromeCreateInput): Promise<Aerodrome>;

  update(id: string, data: Prisma.AerodromeUpdateInput): Promise<Aerodrome>;

  findById(id: string): Promise<Aerodrome | null>;

  findMany(
    where: Prisma.AerodromeWhereInput,
    skip: number,
    take: number,
  ): Promise<Aerodrome[]>;

  count(where: Prisma.AerodromeWhereInput): Promise<number>;

  /** Soft delete usando campos de auditoria deletedAt/deletedBy. */
  softDelete(id: string, deletedBy: string): Promise<Aerodrome>;
}
