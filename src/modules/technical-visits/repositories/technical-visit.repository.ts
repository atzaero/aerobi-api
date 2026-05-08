import { Injectable } from '@nestjs/common';

import { Prisma, type TechnicalVisit } from '@/generated/prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

import type { ITechnicalVisitRepository } from './technical-visit.repository.interface';

const activeWhere: Pick<Prisma.TechnicalVisitWhereInput, 'deletedAt'> = {
  deletedAt: null,
};

@Injectable()
export class TechnicalVisitRepository implements ITechnicalVisitRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.TechnicalVisitCreateInput): Promise<TechnicalVisit> {
    return this.prisma.technicalVisit.create({ data });
  }

  update(
    id: string,
    data: Prisma.TechnicalVisitUpdateInput,
  ): Promise<TechnicalVisit> {
    return this.prisma.technicalVisit.update({
      where: { id, ...activeWhere },
      data,
    });
  }

  findById(id: string): Promise<TechnicalVisit | null> {
    return this.prisma.technicalVisit.findFirst({
      where: { id, ...activeWhere },
    });
  }

  findMany(
    where: Prisma.TechnicalVisitWhereInput,
    skip: number,
    take: number,
  ): Promise<TechnicalVisit[]> {
    return this.prisma.technicalVisit.findMany({
      where: {
        AND: [{ ...where }, activeWhere],
      },
      skip,
      take,
      orderBy: { visitAt: 'desc' },
    });
  }

  count(where: Prisma.TechnicalVisitWhereInput): Promise<number> {
    return this.prisma.technicalVisit.count({
      where: {
        AND: [{ ...where }, activeWhere],
      },
    });
  }

  softDelete(id: string, deletedBy: string): Promise<TechnicalVisit> {
    return this.prisma.technicalVisit.update({
      where: { id, ...activeWhere },
      data: {
        deletedAt: new Date(),
        deletedBy,
        updatedBy: deletedBy,
      },
    });
  }
}
