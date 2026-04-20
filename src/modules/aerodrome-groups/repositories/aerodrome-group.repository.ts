import { Injectable } from '@nestjs/common';

import { Prisma, type AerodromeGroup } from '@/generated/prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

import type { IAerodromeGroupRepository } from './aerodrome-group.repository.interface';

@Injectable()
export class AerodromeGroupRepository implements IAerodromeGroupRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.AerodromeGroupCreateInput): Promise<AerodromeGroup> {
    // TODO: implementar
    return this.prisma.aerodromeGroup.create({ data });
  }

  update(
    id: string,
    data: Prisma.AerodromeGroupUpdateInput,
  ): Promise<AerodromeGroup> {
    // TODO: implementar
    return this.prisma.aerodromeGroup.update({ where: { id }, data });
  }

  findById(id: string): Promise<AerodromeGroup | null> {
    // TODO: implementar (considerar filtrar deletedAt = null)
    return this.prisma.aerodromeGroup.findUnique({ where: { id } });
  }

  findMany(
    where: Prisma.AerodromeGroupWhereInput,
    skip: number,
    take: number,
  ): Promise<AerodromeGroup[]> {
    // TODO: implementar (considerar filtrar deletedAt = null e ordenar)
    return this.prisma.aerodromeGroup.findMany({ where, skip, take });
  }

  count(where: Prisma.AerodromeGroupWhereInput): Promise<number> {
    // TODO: implementar
    return this.prisma.aerodromeGroup.count({ where });
  }

  softDelete(id: string, deletedBy: string): Promise<AerodromeGroup> {
    // TODO: implementar (conferir se updatedBy também precisa ser atualizado)
    return this.prisma.aerodromeGroup.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy },
    });
  }
}
