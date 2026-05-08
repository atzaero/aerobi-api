import { Injectable } from '@nestjs/common';

import { Prisma, type AerodromeFeedback } from '@/generated/prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

import type { IAerodromeFeedbackRepository } from './aerodrome-feedback.repository.interface';

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

  update(
    id: string,
    data: Prisma.AerodromeFeedbackUpdateInput,
  ): Promise<AerodromeFeedback> {
    return this.prisma.aerodromeFeedback.update({
      where: { id, ...activeWhere },
      data,
    });
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
      orderBy: { feedbackDate: 'desc' },
    });
  }

  count(where: Prisma.AerodromeFeedbackWhereInput): Promise<number> {
    return this.prisma.aerodromeFeedback.count({
      where: {
        AND: [{ ...where }, activeWhere],
      },
    });
  }

  softDelete(id: string, deletedBy: string): Promise<AerodromeFeedback> {
    return this.prisma.aerodromeFeedback.update({
      where: { id, ...activeWhere },
      data: {
        deletedAt: new Date(),
        deletedBy,
        updatedBy: deletedBy,
      },
    });
  }
}
