import { Injectable } from '@nestjs/common';

import type {
  Aerodrome,
  Group,
  Maintenance,
  Prisma,
} from '@/generated/prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

import type { IMaintenanceRepository } from './maintenance.repository.interface';

export type MaintenanceWithAerodrome = Maintenance & {
  aerodrome: Aerodrome & { group: Pick<Group, 'uf'> };
};

const maintenanceInclude = {
  aerodrome: { include: { group: { select: { uf: true } } } },
} satisfies Prisma.MaintenanceInclude;

@Injectable()
export class MaintenanceRepository implements IMaintenanceRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.MaintenanceCreateInput): Promise<Maintenance> {
    return this.prisma.maintenance.create({ data });
  }

  update(
    id: string,
    data: Prisma.MaintenanceUpdateInput,
  ): Promise<Maintenance> {
    return this.prisma.maintenance.update({ where: { id }, data });
  }

  findById(id: string): Promise<MaintenanceWithAerodrome | null> {
    return this.prisma.maintenance.findFirst({
      where: { id, deletedAt: null },
      include: maintenanceInclude,
    });
  }

  findMany(
    where: Prisma.MaintenanceWhereInput,
    skip?: number,
    take?: number,
  ): Promise<MaintenanceWithAerodrome[]> {
    return this.prisma.maintenance.findMany({
      where: { ...where, deletedAt: null },
      include: maintenanceInclude,
      orderBy: { updatedAt: 'desc' },
      ...(skip !== undefined ? { skip } : {}),
      ...(take !== undefined ? { take } : {}),
    });
  }

  count(where: Prisma.MaintenanceWhereInput): Promise<number> {
    return this.prisma.maintenance.count({
      where: { ...where, deletedAt: null },
    });
  }

  findActiveAerodrome(
    aerodromeId: string,
  ): Promise<(Aerodrome & { group: Pick<Group, 'uf' | 'id'> }) | null> {
    return this.prisma.aerodrome.findFirst({
      where: { id: aerodromeId, deletedAt: null },
      include: { group: { select: { id: true, uf: true } } },
    });
  }

  findAerodromeInvitationLabel(
    aerodromeId: string,
  ): Promise<{ name: string; icao: string | null } | null> {
    return this.prisma.aerodrome.findFirst({
      where: { id: aerodromeId, deletedAt: null },
      select: { name: true, icao: true },
    });
  }

  countActiveAerodromes(scope: { groupId?: string }): Promise<number> {
    return this.prisma.aerodrome.count({
      where: {
        deletedAt: null,
        ...(scope.groupId !== undefined ? { groupId: scope.groupId } : {}),
      },
    });
  }

  async findActiveAerodromeIds(scope: { groupId?: string }): Promise<string[]> {
    const rows = await this.prisma.aerodrome.findMany({
      where: {
        deletedAt: null,
        ...(scope.groupId !== undefined ? { groupId: scope.groupId } : {}),
      },
      select: { id: true },
    });
    return rows.map((row) => row.id);
  }

  async softDeleteWithTasks(
    id: string,
    actorId: string,
  ): Promise<{ maintenance: Maintenance; deletedTasks: number }> {
    const now = new Date();
    const audit = {
      deletedAt: now,
      deletedBy: actorId,
      updatedAt: now,
      updatedBy: actorId,
    };

    return this.prisma.$transaction(async (tx) => {
      const maintenance = await tx.maintenance.update({
        where: { id, deletedAt: null },
        data: audit,
      });

      await tx.maintenanceGuess.updateMany({
        where: { task: { maintenanceId: id }, deletedAt: null },
        data: audit,
      });

      const taskResult = await tx.maintenanceTask.updateMany({
        where: { maintenanceId: id, deletedAt: null },
        data: audit,
      });

      return { maintenance, deletedTasks: taskResult.count };
    });
  }
}
