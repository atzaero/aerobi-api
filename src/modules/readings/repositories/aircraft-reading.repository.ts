import { Injectable } from '@nestjs/common';

import { Prisma, type AircraftReading } from '@/generated/prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

import type { IAircraftReadingRepository } from './aircraft-reading.repository.interface';

const activeWhere: Pick<Prisma.AircraftReadingWhereInput, 'deletedAt'> = {
  deletedAt: null,
};

@Injectable()
export class AircraftReadingRepository implements IAircraftReadingRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.AircraftReadingCreateInput): Promise<AircraftReading> {
    return this.prisma.aircraftReading.create({ data });
  }

  findById(id: string): Promise<AircraftReading | null> {
    return this.prisma.aircraftReading.findFirst({
      where: { id, ...activeWhere },
    });
  }

  findMany(
    where: Prisma.AircraftReadingWhereInput,
    skip: number,
    take: number,
  ): Promise<AircraftReading[]> {
    return this.prisma.aircraftReading.findMany({
      where: { AND: [{ ...where }, activeWhere] },
      skip,
      take,
      orderBy: { readingDatetime: 'desc' },
    });
  }

  count(where: Prisma.AircraftReadingWhereInput): Promise<number> {
    return this.prisma.aircraftReading.count({
      where: { AND: [{ ...where }, activeWhere] },
    });
  }

  softDelete(id: string, deletedBy: string): Promise<AircraftReading> {
    return this.prisma.aircraftReading.update({
      where: { id, ...activeWhere },
      data: { deletedAt: new Date(), deletedBy, updatedBy: deletedBy },
    });
  }
}
