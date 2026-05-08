import type { Prisma, PilotLanding } from '@/generated/prisma/client';

export interface IPilotLandingRepository {
  create(data: Prisma.PilotLandingCreateInput): Promise<PilotLanding>;

  update(
    id: string,
    data: Prisma.PilotLandingUpdateInput,
  ): Promise<PilotLanding>;

  findById(id: string): Promise<PilotLanding | null>;

  findMany(
    where: Prisma.PilotLandingWhereInput,
    skip: number,
    take: number,
  ): Promise<PilotLanding[]>;

  count(where: Prisma.PilotLandingWhereInput): Promise<number>;

  /** Soft delete usando campos de auditoria deletedAt/deletedBy. */
  softDelete(id: string, deletedBy: string): Promise<PilotLanding>;
}
