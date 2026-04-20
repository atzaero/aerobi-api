import { Injectable } from '@nestjs/common';

import { Prisma, type PilotLanding } from '@/generated/prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

import type { IPilotLandingRepository } from './pilot-landing.repository.interface';

@Injectable()
export class PilotLandingRepository implements IPilotLandingRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.PilotLandingCreateInput): Promise<PilotLanding> {
    // TODO: implementar
    return this.prisma.pilotLanding.create({ data });
  }

  update(
    id: string,
    data: Prisma.PilotLandingUpdateInput,
  ): Promise<PilotLanding> {
    // TODO: implementar
    return this.prisma.pilotLanding.update({ where: { id }, data });
  }

  findById(id: string): Promise<PilotLanding | null> {
    // TODO: implementar (considerar filtrar deletedAt = null)
    return this.prisma.pilotLanding.findUnique({ where: { id } });
  }

  findMany(
    where: Prisma.PilotLandingWhereInput,
    skip: number,
    take: number,
  ): Promise<PilotLanding[]> {
    // TODO: implementar (considerar filtrar deletedAt = null e ordenar)
    return this.prisma.pilotLanding.findMany({ where, skip, take });
  }

  count(where: Prisma.PilotLandingWhereInput): Promise<number> {
    // TODO: implementar
    return this.prisma.pilotLanding.count({ where });
  }

  softDelete(id: string, deletedBy: string): Promise<PilotLanding> {
    // TODO: implementar (conferir se updatedBy também precisa ser atualizado)
    return this.prisma.pilotLanding.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy },
    });
  }
}
