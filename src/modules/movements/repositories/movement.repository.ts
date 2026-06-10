import { Injectable } from '@nestjs/common';

import { Prisma, type Movement } from '@/generated/prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

import type { MovementWithSnapshot } from '../mappers/movement.mapper';

import type { IMovementRepository } from './movement.repository.interface';

const activeWhere: Pick<Prisma.MovementWhereInput, 'deletedAt'> = {
  deletedAt: null,
};

/** Janela da regra toggle de inferência de pouso/decolagem (48h). */
const TOGGLE_WINDOW_MS = 48 * 60 * 60 * 1000;

@Injectable()
export class MovementRepository implements IMovementRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.MovementCreateInput): Promise<Movement> {
    return this.prisma.movement.create({ data });
  }

  findById(id: string): Promise<MovementWithSnapshot | null> {
    return this.prisma.movement.findFirst({
      where: { id, ...activeWhere },
      include: { aircraftSnapshot: true },
    });
  }

  findMany(
    where: Prisma.MovementWhereInput,
    skip: number,
    take: number,
  ): Promise<MovementWithSnapshot[]> {
    return this.prisma.movement.findMany({
      where: { AND: [{ ...where }, activeWhere] },
      skip,
      take,
      orderBy: { readingDatetime: 'desc' },
      include: { aircraftSnapshot: true },
    });
  }

  count(where: Prisma.MovementWhereInput): Promise<number> {
    return this.prisma.movement.count({
      where: { AND: [{ ...where }, activeWhere] },
    });
  }

  softDelete(id: string, deletedBy: string): Promise<Movement> {
    return this.prisma.movement.update({
      where: { id, ...activeWhere },
      data: { deletedAt: new Date(), deletedBy, updatedBy: deletedBy },
    });
  }

  findLastByRegistrationWithin48h(
    registration: string,
    aerodrome: string | null,
    reference: Date,
  ): Promise<Movement | null> {
    const windowStart = new Date(reference.getTime() - TOGGLE_WINDOW_MS);

    return this.prisma.movement.findFirst({
      where: {
        ...activeWhere,
        registration,
        // Estritamente antes de `reference` e dentro das últimas 48h.
        readingDatetime: { gt: windowStart, lt: reference },
        // Só restringe por aeródromo quando ele é conhecido.
        ...(aerodrome !== null ? { aerodrome } : {}),
      },
      orderBy: { readingDatetime: 'desc' },
    });
  }
}
