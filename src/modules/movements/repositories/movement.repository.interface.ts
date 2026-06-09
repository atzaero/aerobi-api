import type { Prisma, Movement } from '@/generated/prisma/client';

export interface IMovementRepository {
  create(data: Prisma.MovementCreateInput): Promise<Movement>;

  findById(id: string): Promise<Movement | null>;

  findMany(
    where: Prisma.MovementWhereInput,
    skip: number,
    take: number,
  ): Promise<Movement[]>;

  count(where: Prisma.MovementWhereInput): Promise<number>;

  /** Soft delete usando os campos de auditoria deletedAt/deletedBy. */
  softDelete(id: string, deletedBy: string): Promise<Movement>;
}
