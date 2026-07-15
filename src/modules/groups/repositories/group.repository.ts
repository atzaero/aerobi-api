import { Injectable } from '@nestjs/common';

import { Prisma, type Group } from '@/generated/prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

import type { IGroupRepository } from './group.repository.interface';

const activeWhere: Pick<Prisma.GroupWhereInput, 'deletedAt'> = {
  deletedAt: null,
};

@Injectable()
export class GroupRepository implements IGroupRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.GroupCreateInput): Promise<Group> {
    return this.prisma.group.create({ data });
  }

  update(id: string, data: Prisma.GroupUpdateInput): Promise<Group> {
    return this.prisma.group.update({
      where: { id, ...activeWhere },
      data,
    });
  }

  findById(id: string): Promise<Group | null> {
    return this.prisma.group.findFirst({
      where: { id, ...activeWhere },
    });
  }

  findMany(
    where: Prisma.GroupWhereInput,
    skip: number,
    take: number,
  ): Promise<Group[]> {
    return this.prisma.group.findMany({
      where: {
        AND: [{ ...where }, activeWhere],
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  count(where: Prisma.GroupWhereInput): Promise<number> {
    return this.prisma.group.count({
      where: {
        AND: [{ ...where }, activeWhere],
      },
    });
  }

  /**
   * Soft-delete do grupo + cascata (espelha o `aerobi-web`): na mesma transação,
   * fecha os aeródromos operacionais ativos do grupo (`isOpen=false`,
   * `isView=false`), soft-deleta as imagens ativas e zera o `imageKey` (sem
   * imagem ativa para grupo inativo). Devolve o grupo removido e quantos
   * aeródromos foram afetados.
   */
  async softDeleteWithCascade(
    id: string,
    deletedBy: string,
  ): Promise<{ group: Group; affectedAerodromes: number }> {
    return this.prisma.$transaction(async (tx) => {
      const group = await tx.group.update({
        where: { id, ...activeWhere },
        data: {
          deletedAt: new Date(),
          deletedBy,
          updatedBy: deletedBy,
          imageKey: null,
        },
      });

      const { count } = await tx.aerodrome.updateMany({
        where: { groupId: id, deletedAt: null },
        data: {
          isOpen: false,
          isView: false,
          updatedBy: deletedBy,
        },
      });

      await tx.groupImage.updateMany({
        where: { groupId: id, deletedAt: null },
        data: { deletedAt: new Date(), deletedBy, updatedBy: deletedBy },
      });

      return { group, affectedAerodromes: count };
    });
  }
}
