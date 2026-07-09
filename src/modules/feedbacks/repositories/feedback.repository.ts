import { Injectable } from '@nestjs/common';

import { Prisma, type Feedback } from '@/generated/prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

import type {
  FeedbackDashboardRow,
  FeedbackRatingCount,
  IFeedbackRepository,
} from './feedback.repository.interface';

const activeWhere: Pick<Prisma.FeedbackWhereInput, 'deletedAt'> = {
  deletedAt: null,
};

@Injectable()
export class FeedbackRepository implements IFeedbackRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.FeedbackCreateInput): Promise<Feedback> {
    return this.prisma.feedback.create({ data });
  }

  findById(id: string): Promise<Feedback | null> {
    return this.prisma.feedback.findFirst({
      where: { id, ...activeWhere },
    });
  }

  findMany(
    where: Prisma.FeedbackWhereInput,
    skip: number,
    take: number,
  ): Promise<Feedback[]> {
    return this.prisma.feedback.findMany({
      where: {
        AND: [{ ...where }, activeWhere],
      },
      skip,
      take,
      /**
       * `createdAt DESC` (paridade com o web) + `id` como tiebreaker: garante
       * paginação determinística quando dois feedbacks compartilham o mesmo
       * `createdAt`.
       */
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });
  }

  count(where: Prisma.FeedbackWhereInput): Promise<number> {
    return this.prisma.feedback.count({
      where: {
        AND: [{ ...where }, activeWhere],
      },
    });
  }

  findForDashboard(
    aerodromeIds: string[] | null,
    fromMs: number,
    toMs: number,
  ): Promise<FeedbackDashboardRow[]> {
    const where: Prisma.FeedbackWhereInput = {
      ...activeWhere,
      createdAt: { gte: new Date(fromMs), lte: new Date(toMs) },
    };
    if (aerodromeIds !== null) where.aerodromeId = { in: aerodromeIds };

    return this.prisma.feedback.findMany({ where, select: { rating: true } });
  }

  /**
   * Soft-delete: seta apenas `deletedAt`/`deletedBy`. **Não** sobrescreve
   * `updatedBy` (diverge do soft-delete de `aerodromes`/`landing-requests` de
   * propósito): o feedback é imutável — nunca é editado — então preservar o
   * `updatedBy` original (sempre `null`) espelha o `delete` do `aerobi-web`. O
   * `updatedAt` é tocado pelo `@updatedAt` do Prisma (inevitável num `update`;
   * não é invariante de negócio).
   */
  softDelete(id: string, deletedBy: string): Promise<Feedback> {
    return this.prisma.feedback.update({
      where: { id, ...activeWhere },
      data: {
        deletedAt: new Date(),
        deletedBy,
      },
    });
  }

  findActiveAerodrome(aerodromeId: string): Promise<{ id: string } | null> {
    return this.prisma.aerodrome.findFirst({
      where: { id: aerodromeId, deletedAt: null },
      select: { id: true },
    });
  }

  async summaryByAerodrome(
    aerodromeId: string,
  ): Promise<FeedbackRatingCount[]> {
    const grouped = await this.prisma.feedback.groupBy({
      by: ['rating'],
      where: { aerodromeId, ...activeWhere },
      _count: { _all: true },
    });
    return grouped.map((row) => ({
      rating: row.rating,
      count: row._count._all,
    }));
  }
}
