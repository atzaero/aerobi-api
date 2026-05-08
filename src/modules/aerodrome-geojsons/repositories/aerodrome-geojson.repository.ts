import { Injectable } from '@nestjs/common';

import { Prisma, type AerodromeGeojson } from '@/generated/prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

import type { IAerodromeGeojsonRepository } from './aerodrome-geojson.repository.interface';

const activeWhere: Pick<Prisma.AerodromeGeojsonWhereInput, 'deletedAt'> = {
  deletedAt: null,
};

@Injectable()
export class AerodromeGeojsonRepository implements IAerodromeGeojsonRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.AerodromeGeojsonCreateInput): Promise<AerodromeGeojson> {
    return this.prisma.aerodromeGeojson.create({ data });
  }

  update(
    id: string,
    data: Prisma.AerodromeGeojsonUpdateInput,
  ): Promise<AerodromeGeojson> {
    return this.prisma.aerodromeGeojson.update({
      where: { id, ...activeWhere },
      data,
    });
  }

  findById(id: string): Promise<AerodromeGeojson | null> {
    return this.prisma.aerodromeGeojson.findFirst({
      where: { id, ...activeWhere },
    });
  }

  findMany(
    where: Prisma.AerodromeGeojsonWhereInput,
    skip: number,
    take: number,
  ): Promise<AerodromeGeojson[]> {
    return this.prisma.aerodromeGeojson.findMany({
      where: {
        AND: [{ ...where }, activeWhere],
      },
      skip,
      take,
      orderBy: { updatedAt: 'desc' },
    });
  }

  count(where: Prisma.AerodromeGeojsonWhereInput): Promise<number> {
    return this.prisma.aerodromeGeojson.count({
      where: {
        AND: [{ ...where }, activeWhere],
      },
    });
  }

  softDelete(id: string, deletedBy: string): Promise<AerodromeGeojson> {
    return this.prisma.aerodromeGeojson.update({
      where: { id, ...activeWhere },
      data: {
        deletedAt: new Date(),
        deletedBy,
        updatedBy: deletedBy,
      },
    });
  }
}
