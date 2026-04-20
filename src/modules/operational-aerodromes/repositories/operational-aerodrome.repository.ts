import { Injectable } from '@nestjs/common';

import { Prisma, type OperationalAerodrome } from '@/generated/prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

import type { IOperationalAerodromeRepository } from './operational-aerodrome.repository.interface';

@Injectable()
export class OperationalAerodromeRepository implements IOperationalAerodromeRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(
    data: Prisma.OperationalAerodromeCreateInput,
  ): Promise<OperationalAerodrome> {
    // TODO: implementar
    return this.prisma.operationalAerodrome.create({ data });
  }

  update(
    id: string,
    data: Prisma.OperationalAerodromeUpdateInput,
  ): Promise<OperationalAerodrome> {
    // TODO: implementar
    return this.prisma.operationalAerodrome.update({ where: { id }, data });
  }

  findById(id: string): Promise<OperationalAerodrome | null> {
    // TODO: implementar (considerar filtrar deletedAt = null)
    return this.prisma.operationalAerodrome.findUnique({ where: { id } });
  }

  findMany(
    where: Prisma.OperationalAerodromeWhereInput,
    skip: number,
    take: number,
  ): Promise<OperationalAerodrome[]> {
    // TODO: implementar (considerar filtrar deletedAt = null e ordenar)
    return this.prisma.operationalAerodrome.findMany({ where, skip, take });
  }

  count(where: Prisma.OperationalAerodromeWhereInput): Promise<number> {
    // TODO: implementar
    return this.prisma.operationalAerodrome.count({ where });
  }

  softDelete(id: string, deletedBy: string): Promise<OperationalAerodrome> {
    // TODO: implementar (conferir se updatedBy também precisa ser atualizado)
    return this.prisma.operationalAerodrome.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy },
    });
  }
}
