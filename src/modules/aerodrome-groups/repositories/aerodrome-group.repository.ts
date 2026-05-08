import { Injectable } from '@nestjs/common';

import { Prisma, type AerodromeGroup } from '@/generated/prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

import type { IAerodromeGroupRepository } from './aerodrome-group.repository.interface';

const activeWhere: Pick<Prisma.AerodromeGroupWhereInput, 'deletedAt'> = {
  deletedAt: null,
};

@Injectable()
export class AerodromeGroupRepository implements IAerodromeGroupRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.AerodromeGroupCreateInput): Promise<AerodromeGroup> {
    return this.prisma.aerodromeGroup.create({ data });
  }

  update(
    id: string,
    data: Prisma.AerodromeGroupUpdateInput,
  ): Promise<AerodromeGroup> {
    return this.prisma.aerodromeGroup.update({
      where: { id, ...activeWhere },
      data,
    });
  }

  findById(id: string): Promise<AerodromeGroup | null> {
    return this.prisma.aerodromeGroup.findFirst({
      where: { id, ...activeWhere },
    });
  }

  findMany(
    where: Prisma.AerodromeGroupWhereInput,
    skip: number,
    take: number,
  ): Promise<AerodromeGroup[]> {
    return this.prisma.aerodromeGroup.findMany({
      where: {
        AND: [{ ...where }, activeWhere],
      },
      skip,
      take,
      orderBy: { updatedAt: 'desc' },
    });
  }

  count(where: Prisma.AerodromeGroupWhereInput): Promise<number> {
    return this.prisma.aerodromeGroup.count({
      where: {
        AND: [{ ...where }, activeWhere],
      },
    });
  }

  softDelete(id: string, deletedBy: string): Promise<AerodromeGroup> {
    return this.prisma.aerodromeGroup.update({
      where: { id, ...activeWhere },
      data: {
        deletedAt: new Date(),
        deletedBy,
        updatedBy: deletedBy,
      },
    });
  }
}
