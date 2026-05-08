import { Injectable } from '@nestjs/common';

import { Prisma, type PilotLanding } from '@/generated/prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

import type { IPilotLandingRepository } from './pilot-landing.repository.interface';

/** Filtro base: apenas registos não apagados (soft delete). */
const activeWhere: Pick<Prisma.PilotLandingWhereInput, 'deletedAt'> = {
  deletedAt: null,
};

@Injectable()
export class PilotLandingRepository implements IPilotLandingRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.PilotLandingCreateInput): Promise<PilotLanding> {
    return this.prisma.pilotLanding.create({ data });
  }

  update(
    id: string,
    data: Prisma.PilotLandingUpdateInput,
  ): Promise<PilotLanding> {
    return this.prisma.pilotLanding.update({
      where: {
        id,
        ...activeWhere,
      },
      data,
    });
  }

  findById(id: string): Promise<PilotLanding | null> {
    return this.prisma.pilotLanding.findFirst({
      where: { id, ...activeWhere },
    });
  }

  findMany(
    where: Prisma.PilotLandingWhereInput,
    skip: number,
    take: number,
  ): Promise<PilotLanding[]> {
    return this.prisma.pilotLanding.findMany({
      where: {
        AND: [{ ...where }, activeWhere],
      },
      skip,
      take,
      orderBy: { landingAt: 'desc' },
    });
  }

  count(where: Prisma.PilotLandingWhereInput): Promise<number> {
    return this.prisma.pilotLanding.count({
      where: {
        AND: [{ ...where }, activeWhere],
      },
    });
  }

  softDelete(id: string, deletedBy: string): Promise<PilotLanding> {
    return this.prisma.pilotLanding.update({
      where: {
        id,
        ...activeWhere,
      },
      data: {
        deletedAt: new Date(),
        deletedBy,
        updatedBy: deletedBy,
      },
    });
  }
}
