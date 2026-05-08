import { Injectable } from '@nestjs/common';

import { Prisma, type OperationalAerodrome } from '@/generated/prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

import type { IOperationalAerodromeRepository } from './operational-aerodrome.repository.interface';

const activeWhere: Pick<Prisma.OperationalAerodromeWhereInput, 'deletedAt'> = {
  deletedAt: null,
};

@Injectable()
export class OperationalAerodromeRepository implements IOperationalAerodromeRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(
    data: Prisma.OperationalAerodromeCreateInput,
  ): Promise<OperationalAerodrome> {
    return this.prisma.operationalAerodrome.create({ data });
  }

  update(
    id: string,
    data: Prisma.OperationalAerodromeUpdateInput,
  ): Promise<OperationalAerodrome> {
    return this.prisma.operationalAerodrome.update({
      where: { id, ...activeWhere },
      data,
    });
  }

  findById(id: string): Promise<OperationalAerodrome | null> {
    return this.prisma.operationalAerodrome.findFirst({
      where: { id, ...activeWhere },
    });
  }

  findMany(
    where: Prisma.OperationalAerodromeWhereInput,
    skip: number,
    take: number,
  ): Promise<OperationalAerodrome[]> {
    return this.prisma.operationalAerodrome.findMany({
      where: {
        AND: [{ ...where }, activeWhere],
      },
      skip,
      take,
      orderBy: [{ icao: 'asc' }],
    });
  }

  count(where: Prisma.OperationalAerodromeWhereInput): Promise<number> {
    return this.prisma.operationalAerodrome.count({
      where: {
        AND: [{ ...where }, activeWhere],
      },
    });
  }

  softDelete(id: string, deletedBy: string): Promise<OperationalAerodrome> {
    return this.prisma.operationalAerodrome.update({
      where: { id, ...activeWhere },
      data: {
        deletedAt: new Date(),
        deletedBy,
        updatedBy: deletedBy,
      },
    });
  }
}
