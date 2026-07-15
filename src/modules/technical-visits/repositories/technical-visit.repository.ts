import { Injectable } from '@nestjs/common';

import { Prisma, type TechnicalVisit } from '@/generated/prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

import type {
  AerodromeScopeRef,
  ITechnicalVisitRepository,
  TechnicalVisitDashboardRow,
} from './technical-visit.repository.interface';
import {
  technicalVisitWithAerodromeInclude,
  type TechnicalVisitWithAerodrome,
} from '../types/technical-visit-with-aerodrome.type';

const activeWhere: Pick<Prisma.TechnicalVisitWhereInput, 'deletedAt'> = {
  deletedAt: null,
};

const listOrderBy: Prisma.TechnicalVisitOrderByWithRelationInput[] = [
  { visitAt: 'desc' },
  { createdAt: 'desc' },
  { id: 'desc' },
];

@Injectable()
export class TechnicalVisitRepository implements ITechnicalVisitRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(
    data: Prisma.TechnicalVisitCreateInput,
  ): Promise<TechnicalVisitWithAerodrome> {
    return this.prisma.technicalVisit.create({
      data,
      include: technicalVisitWithAerodromeInclude,
    });
  }

  update(
    id: string,
    data: Prisma.TechnicalVisitUpdateInput,
  ): Promise<TechnicalVisitWithAerodrome> {
    return this.prisma.technicalVisit.update({
      where: { id, ...activeWhere },
      data,
      include: technicalVisitWithAerodromeInclude,
    });
  }

  findById(id: string): Promise<TechnicalVisit | null> {
    return this.prisma.technicalVisit.findFirst({
      where: { id, ...activeWhere },
    });
  }

  findByIdWithAerodrome(
    id: string,
  ): Promise<TechnicalVisitWithAerodrome | null> {
    return this.prisma.technicalVisit.findFirst({
      where: { id, ...activeWhere },
      include: technicalVisitWithAerodromeInclude,
    });
  }

  findMany(
    where: Prisma.TechnicalVisitWhereInput,
    skip: number,
    take: number,
  ): Promise<TechnicalVisitWithAerodrome[]> {
    return this.prisma.technicalVisit.findMany({
      where: {
        AND: [{ ...where }, activeWhere],
      },
      skip,
      take,
      orderBy: listOrderBy,
      include: technicalVisitWithAerodromeInclude,
    });
  }

  count(where: Prisma.TechnicalVisitWhereInput): Promise<number> {
    return this.prisma.technicalVisit.count({
      where: {
        AND: [{ ...where }, activeWhere],
      },
    });
  }

  async findForDashboard(
    aerodromeIds: string[] | null,
    fromMs: number,
    toMs: number,
  ): Promise<TechnicalVisitDashboardRow[]> {
    const where: Prisma.TechnicalVisitWhereInput = {
      ...activeWhere,
      visitAt: { gte: new Date(fromMs), lte: new Date(toMs) },
    };
    if (aerodromeIds !== null) where.aerodromeId = { in: aerodromeIds };

    const rows = await this.prisma.technicalVisit.findMany({
      where,
      select: {
        visitAt: true,
        hasGatesPadlocks: true,
        hasFence: true,
        hasStandardPlate: true,
        hasQualityHoles: true,
        hasHorizontalSignage: true,
        hasUnobstructedHeadboards: true,
        pavementRegularity: true,
        hasTrashDebris: true,
        hasDelimitedPerimeter: true,
        hasInvasion: true,
      },
    });
    return rows.map((r) => ({
      visitAtMs: r.visitAt.getTime(),
      hasGatesPadlocks: r.hasGatesPadlocks,
      hasFence: r.hasFence,
      hasStandardPlate: r.hasStandardPlate,
      hasQualityHoles: r.hasQualityHoles,
      hasHorizontalSignage: r.hasHorizontalSignage,
      hasUnobstructedHeadboards: r.hasUnobstructedHeadboards,
      pavementRegularity: r.pavementRegularity,
      hasTrashDebris: r.hasTrashDebris,
      hasDelimitedPerimeter: r.hasDelimitedPerimeter,
      hasInvasion: r.hasInvasion,
    }));
  }

  findAerodromeGroupForScope(
    aerodromeId: string,
  ): Promise<AerodromeScopeRef | null> {
    return this.prisma.aerodrome.findFirst({
      where: { id: aerodromeId, deletedAt: null },
      select: { groupId: true },
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
