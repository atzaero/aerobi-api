import { Injectable } from '@nestjs/common';

import type { MaintenanceTask, Prisma } from '@/generated/prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

import type { IMaintenanceTaskRepository } from './maintenance-task.repository.interface';

@Injectable()
export class MaintenanceTaskRepository implements IMaintenanceTaskRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.MaintenanceTaskCreateInput): Promise<MaintenanceTask> {
    return this.prisma.maintenanceTask.create({ data });
  }

  update(
    id: string,
    data: Prisma.MaintenanceTaskUpdateInput,
  ): Promise<MaintenanceTask> {
    return this.prisma.maintenanceTask.update({ where: { id }, data });
  }

  findById(id: string): Promise<MaintenanceTask | null> {
    return this.prisma.maintenanceTask.findFirst({
      where: { id, deletedAt: null },
    });
  }

  findManyByMaintenanceId(maintenanceId: string): Promise<MaintenanceTask[]> {
    return this.prisma.maintenanceTask.findMany({
      where: { maintenanceId, deletedAt: null },
      orderBy: [
        { urgency: 'asc' },
        { predictedDate: 'asc' },
        { createdAt: 'desc' },
      ],
    });
  }

  async countActiveGuessesByTaskIds(
    taskIds: readonly string[],
  ): Promise<Map<string, number>> {
    if (taskIds.length === 0) return new Map();

    const rows = await this.prisma.maintenanceGuess.groupBy({
      by: ['taskId'],
      where: { taskId: { in: [...taskIds] }, deletedAt: null },
      _count: { _all: true },
    });

    const map = new Map<string, number>();
    for (const row of rows) {
      map.set(row.taskId, row._count._all);
    }
    return map;
  }

  findTasksForMaintenanceIds(
    maintenanceIds: readonly string[],
  ): Promise<
    Pick<
      MaintenanceTask,
      'id' | 'maintenanceId' | 'status' | 'predictedDate' | 'delayWarning'
    >[]
  > {
    if (maintenanceIds.length === 0) return Promise.resolve([]);
    return this.prisma.maintenanceTask.findMany({
      where: { maintenanceId: { in: [...maintenanceIds] }, deletedAt: null },
      select: {
        id: true,
        maintenanceId: true,
        status: true,
        predictedDate: true,
        delayWarning: true,
      },
    });
  }

  findTasksForStats(aerodromeIds: readonly string[] | null): Promise<
    Array<{
      maintenanceId: string;
      aerodromeId: string;
      investmentType: MaintenanceTask['investmentType'];
      predictedValue: MaintenanceTask['predictedValue'];
      status: MaintenanceTask['status'];
      predictedDate: MaintenanceTask['predictedDate'];
      delayWarning: MaintenanceTask['delayWarning'];
      urgency: MaintenanceTask['urgency'];
    }>
  > {
    const where: Prisma.MaintenanceTaskWhereInput = { deletedAt: null };
    if (aerodromeIds != null) {
      where.maintenance = { aerodromeId: { in: [...aerodromeIds] } };
    }
    return this.prisma.maintenanceTask
      .findMany({
        where,
        select: {
          maintenanceId: true,
          investmentType: true,
          predictedValue: true,
          status: true,
          predictedDate: true,
          delayWarning: true,
          urgency: true,
          maintenance: { select: { aerodromeId: true } },
        },
      })
      .then((rows) =>
        rows.map((row) => ({
          maintenanceId: row.maintenanceId,
          aerodromeId: row.maintenance.aerodromeId,
          investmentType: row.investmentType,
          predictedValue: row.predictedValue,
          status: row.status,
          predictedDate: row.predictedDate,
          delayWarning: row.delayWarning,
          urgency: row.urgency,
        })),
      );
  }

  softDelete(
    id: string,
    actorId: string,
  ): Promise<{ task: MaintenanceTask; deletedGuesses: number }> {
    const now = new Date();
    const audit = {
      deletedAt: now,
      deletedBy: actorId,
      updatedAt: now,
      updatedBy: actorId,
    };
    return this.prisma.$transaction(async (tx) => {
      const guessResult = await tx.maintenanceGuess.updateMany({
        where: { taskId: id, deletedAt: null },
        data: audit,
      });
      const task = await tx.maintenanceTask.update({
        where: { id, deletedAt: null },
        data: audit,
      });
      return { task, deletedGuesses: guessResult.count };
    });
  }

  findMaintenanceAerodromeId(
    maintenanceId: string,
  ): Promise<{ aerodromeId: string } | null> {
    return this.prisma.maintenance.findFirst({
      where: { id: maintenanceId, deletedAt: null },
      select: { aerodromeId: true },
    });
  }
}
