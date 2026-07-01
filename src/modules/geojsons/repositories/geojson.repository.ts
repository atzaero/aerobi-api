import { Injectable } from '@nestjs/common';

import { Prisma, type Geojson } from '@/generated/prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

import type { IGeojsonRepository } from './geojson.repository.interface';

const activeWhere: Pick<Prisma.GeojsonWhereInput, 'deletedAt'> = {
  deletedAt: null,
};

@Injectable()
export class GeojsonRepository implements IGeojsonRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.GeojsonCreateInput): Promise<Geojson> {
    return this.prisma.geojson.create({ data });
  }

  update(id: string, data: Prisma.GeojsonUpdateInput): Promise<Geojson> {
    return this.prisma.geojson.update({
      where: { id, ...activeWhere },
      data,
    });
  }

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
}
