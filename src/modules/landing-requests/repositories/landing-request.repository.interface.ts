import type { Prisma, LandingRequest } from '@/generated/prisma/client';

export interface ILandingRequestRepository {
  create(data: Prisma.LandingRequestCreateInput): Promise<LandingRequest>;

  update(
    id: string,
    data: Prisma.LandingRequestUpdateInput,
  ): Promise<LandingRequest>;

  findById(id: string): Promise<LandingRequest | null>;

  findMany(
    where: Prisma.LandingRequestWhereInput,
    skip: number,
    take: number,
  ): Promise<LandingRequest[]>;

  count(where: Prisma.LandingRequestWhereInput): Promise<number>;

  /** Soft delete usando campos de auditoria deletedAt/deletedBy. */
  softDelete(id: string, deletedBy: string): Promise<LandingRequest>;
}
