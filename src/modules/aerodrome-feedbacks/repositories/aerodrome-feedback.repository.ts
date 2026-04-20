import { Injectable } from '@nestjs/common';

import { Prisma, type AerodromeFeedback } from '@/generated/prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

import type { IAerodromeFeedbackRepository } from './aerodrome-feedback.repository.interface';

@Injectable()
export class AerodromeFeedbackRepository implements IAerodromeFeedbackRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(
    data: Prisma.AerodromeFeedbackCreateInput,
  ): Promise<AerodromeFeedback> {
    // TODO: implementar
    return this.prisma.aerodromeFeedback.create({ data });
  }

  update(
    id: string,
    data: Prisma.AerodromeFeedbackUpdateInput,
  ): Promise<AerodromeFeedback> {
    // TODO: implementar
    return this.prisma.aerodromeFeedback.update({ where: { id }, data });
  }

  findById(id: string): Promise<AerodromeFeedback | null> {
    // TODO: implementar (considerar filtrar deletedAt = null)
    return this.prisma.aerodromeFeedback.findUnique({ where: { id } });
  }

  findMany(
    where: Prisma.AerodromeFeedbackWhereInput,
    skip: number,
    take: number,
  ): Promise<AerodromeFeedback[]> {
    // TODO: implementar (considerar filtrar deletedAt = null e ordenar)
    return this.prisma.aerodromeFeedback.findMany({ where, skip, take });
  }

  count(where: Prisma.AerodromeFeedbackWhereInput): Promise<number> {
    // TODO: implementar
    return this.prisma.aerodromeFeedback.count({ where });
  }

  softDelete(id: string, deletedBy: string): Promise<AerodromeFeedback> {
    // TODO: implementar (conferir se updatedBy também precisa ser atualizado)
    return this.prisma.aerodromeFeedback.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy },
    });
  }
}
