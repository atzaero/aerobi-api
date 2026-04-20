import { Injectable } from '@nestjs/common';

import { Prisma, type TechnicalVisit } from '@/generated/prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

import type { ITechnicalVisitRepository } from './technical-visit.repository.interface';

@Injectable()
export class TechnicalVisitRepository implements ITechnicalVisitRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.TechnicalVisitCreateInput): Promise<TechnicalVisit> {
    // TODO: implementar
    return this.prisma.technicalVisit.create({ data });
  }

  update(
    id: string,
    data: Prisma.TechnicalVisitUpdateInput,
  ): Promise<TechnicalVisit> {
    // TODO: implementar
    return this.prisma.technicalVisit.update({ where: { id }, data });
  }

  findById(id: string): Promise<TechnicalVisit | null> {
    // TODO: implementar (considerar filtrar deletedAt = null)
    return this.prisma.technicalVisit.findUnique({ where: { id } });
  }

  findMany(
    where: Prisma.TechnicalVisitWhereInput,
    skip: number,
    take: number,
  ): Promise<TechnicalVisit[]> {
    // TODO: implementar (considerar filtrar deletedAt = null e ordenar)
    return this.prisma.technicalVisit.findMany({ where, skip, take });
  }

  count(where: Prisma.TechnicalVisitWhereInput): Promise<number> {
    // TODO: implementar
    return this.prisma.technicalVisit.count({ where });
  }

  softDelete(id: string, deletedBy: string): Promise<TechnicalVisit> {
    // TODO: implementar (conferir se updatedBy também precisa ser atualizado)
    return this.prisma.technicalVisit.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy },
    });
  }
}
