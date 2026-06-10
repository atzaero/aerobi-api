import type { Prisma, Movement } from '@/generated/prisma/client';

import type { MovementWithSnapshot } from '../mappers/movement.mapper';

export interface IMovementRepository {
  create(data: Prisma.MovementCreateInput): Promise<Movement>;

  findById(id: string): Promise<MovementWithSnapshot | null>;

  findMany(
    where: Prisma.MovementWhereInput,
    skip: number,
    take: number,
  ): Promise<MovementWithSnapshot[]>;

  count(where: Prisma.MovementWhereInput): Promise<number>;

  /** Soft delete usando os campos de auditoria deletedAt/deletedBy. */
  softDelete(id: string, deletedBy: string): Promise<Movement>;
}
