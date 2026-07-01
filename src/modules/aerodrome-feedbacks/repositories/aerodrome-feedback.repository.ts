import { Injectable } from '@nestjs/common';

import { Prisma, type AerodromeFeedback } from '@/generated/prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

import type {
  FeedbackRatingCount,
  IAerodromeFeedbackRepository,
} from './aerodrome-feedback.repository.interface';

const activeWhere: Pick<Prisma.AerodromeFeedbackWhereInput, 'deletedAt'> = {
  deletedAt: null,
};

@Injectable()
export class AerodromeFeedbackRepository implements IAerodromeFeedbackRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(
    data: Prisma.AerodromeFeedbackCreateInput,
  ): Promise<AerodromeFeedback> {
    return this.prisma.aerodromeFeedback.create({ data });
  }

  findById(id: string): Promise<AerodromeFeedback | null> {
    return this.prisma.aerodromeFeedback.findFirst({
      where: { id, ...activeWhere },
    });
  }

  findMany(
    where: Prisma.AerodromeFeedbackWhereInput,
    skip: number,
    take: number,
  ): Promise<AerodromeFeedback[]> {
    return this.prisma.aerodromeFeedback.findMany({
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

  count(where: Prisma.AerodromeFeedbackWhereInput): Promise<number> {
    return this.prisma.aerodromeFeedback.count({
      where: {
        AND: [{ ...where }, activeWhere],
      },
    });
  }

  /**
   * Soft-delete: seta apenas `deletedAt`/`deletedBy`. **Não** sobrescreve
   * `updatedBy` (diverge do soft-delete de `aerodromes`/`landing-requests` de
   * propósito): o feedback é imutável — nunca é editado — então preservar o
   * `updatedBy` original (sempre `null`) espelha o `delete` do `aerobi-web`. O
   * `updatedAt` é tocado pelo `@updatedAt` do Prisma (inevitável num `update`;
   * não é invariante de negócio).
   */
  softDelete(id: string, deletedBy: string): Promise<AerodromeFeedback> {
    return this.prisma.aerodromeFeedback.update({
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
    const grouped = await this.prisma.aerodromeFeedback.groupBy({
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
