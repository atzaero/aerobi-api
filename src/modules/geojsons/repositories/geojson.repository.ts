import { Injectable } from '@nestjs/common';

import { Prisma, type Geojson } from '@/generated/prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

import type {
  GeojsonWithAerodrome,
  IGeojsonRepository,
} from './geojson.repository.interface';

/** Re-export para consumidores do repo sem expor a interface. */
export type { GeojsonWithAerodrome } from './geojson.repository.interface';

const activeWhere: Pick<Prisma.GeojsonWhereInput, 'deletedAt'> = {
  deletedAt: null,
};

/** Campos do aeródromo pai projetados no response de leitura por aeródromo. */
const aerodromeSelect = {
  aerodrome: {
    select: {
      icao: true,
      groupId: true,
      group: { select: { uf: true } },
    },
  },
} satisfies Prisma.GeojsonInclude;

@Injectable()
export class GeojsonRepository implements IGeojsonRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<Geojson | null> {
    return this.prisma.geojson.findFirst({
      where: { id, ...activeWhere },
    });
  }

  findMany(
    where: Prisma.GeojsonWhereInput,
    skip: number,
    take: number,
  ): Promise<Geojson[]> {
    return this.prisma.geojson.findMany({
      where: {
        AND: [{ ...where }, activeWhere],
      },
      skip,
      take,
      orderBy: { updatedAt: 'desc' },
    });
  }

  count(where: Prisma.GeojsonWhereInput): Promise<number> {
    return this.prisma.geojson.count({
      where: {
        AND: [{ ...where }, activeWhere],
      },
    });
  }

  softDelete(id: string, deletedBy: string): Promise<Geojson> {
    return this.prisma.geojson.update({
      where: { id, ...activeWhere },
      data: {
        deletedAt: new Date(),
        deletedBy,
        updatedBy: deletedBy,
      },
    });
  }

  findActiveByAerodromeId(
    aerodromeId: string,
  ): Promise<GeojsonWithAerodrome | null> {
    return this.prisma.geojson.findFirst({
      where: { aerodromeId, ...activeWhere },
      include: aerodromeSelect,
    });
  }

  findByAerodromeIdAnyState(aerodromeId: string): Promise<Geojson | null> {
    return this.prisma.geojson.findUnique({ where: { aerodromeId } });
  }

  async aerodromeExists(aerodromeId: string): Promise<boolean> {
    const aerodrome = await this.prisma.aerodrome.findFirst({
      where: { id: aerodromeId, deletedAt: null },
      select: { id: true },
    });
    return aerodrome !== null;
  }

  upsertByAerodromeId(
    aerodromeId: string,
    create: Prisma.GeojsonCreateInput,
    update: Prisma.GeojsonUpdateInput,
  ): Promise<Geojson> {
    return this.prisma.geojson.upsert({
      where: { aerodromeId },
      create,
      update,
    });
  }
}
