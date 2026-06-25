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
      orderBy: { createdAt: 'desc' },
    });
  }

  count(where: Prisma.AerodromeGroupWhereInput): Promise<number> {
    return this.prisma.aerodromeGroup.count({
      where: {
        AND: [{ ...where }, activeWhere],
      },
    });
  }

  /**
   * Soft-delete do grupo + cascata (espelha o `aerobi-web`): na mesma transação,
   * fecha os aeródromos operacionais ativos do grupo (`isOpen=false`,
   * `isView=false`). Devolve o grupo removido e quantos aeródromos foram
   * afetados.
   */
  async softDeleteWithCascade(
    id: string,
    deletedBy: string,
  ): Promise<{ group: AerodromeGroup; affectedAerodromes: number }> {
    return this.prisma.$transaction(async (tx) => {
      const group = await tx.aerodromeGroup.update({
        where: { id, ...activeWhere },
        data: {
          deletedAt: new Date(),
          deletedBy,
          updatedBy: deletedBy,
        },
      });

      const { count } = await tx.operationalAerodrome.updateMany({
        where: { groupId: id, deletedAt: null },
        data: {
          isOpen: false,
          isView: false,
          updatedBy: deletedBy,
        },
      });

      return { group, affectedAerodromes: count };
    });
  }
}
