import { Injectable } from '@nestjs/common';

import { Prisma, type Aerodrome } from '@/generated/prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

import type { IAerodromeRepository } from './aerodrome.repository.interface';

const activeWhere: Pick<Prisma.AerodromeWhereInput, 'deletedAt'> = {
  deletedAt: null,
};

@Injectable()
export class AerodromeRepository implements IAerodromeRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.AerodromeCreateInput): Promise<Aerodrome> {
    return this.prisma.aerodrome.create({ data });
  }

  update(id: string, data: Prisma.AerodromeUpdateInput): Promise<Aerodrome> {
    return this.prisma.aerodrome.update({
      where: { id, ...activeWhere },
      data,
    });
  }

  findById(id: string): Promise<Aerodrome | null> {
    return this.prisma.aerodrome.findFirst({
      where: { id, ...activeWhere },
    });
  }

  findMany(
    where: Prisma.AerodromeWhereInput,
    skip: number,
    take: number,
  ): Promise<Aerodrome[]> {
    return this.prisma.aerodrome.findMany({
      where: {
        AND: [{ ...where }, activeWhere],
      },
      skip,
      take,
      orderBy: [{ icao: 'asc' }],
    });
  }

  count(where: Prisma.AerodromeWhereInput): Promise<number> {
    return this.prisma.aerodrome.count({
      where: {
        AND: [{ ...where }, activeWhere],
      },
    });
  }

  softDelete(id: string, deletedBy: string): Promise<Aerodrome> {
    return this.prisma.aerodrome.update({
      where: { id, ...activeWhere },
      data: {
        deletedAt: new Date(),
        deletedBy,
        updatedBy: deletedBy,
      },
    });
  }
}
