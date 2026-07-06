import { Injectable } from '@nestjs/common';

import type { MaintenanceGuess, Prisma } from '@/generated/prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

import type {
  IMaintenanceGuessRepository,
  MaintenanceGuessWithTask,
} from './maintenance-guess.repository.interface';

@Injectable()
export class MaintenanceGuessRepository implements IMaintenanceGuessRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<MaintenanceGuessWithTask | null> {
    return this.prisma.maintenanceGuess.findFirst({
      where: {
        id,
        deletedAt: null,
        task: { deletedAt: null, maintenance: { deletedAt: null } },
      },
      include: { task: { select: { maintenanceId: true } } },
    });
  }

  findActiveByTaskId(taskId: string): Promise<MaintenanceGuess[]> {
    return this.prisma.maintenanceGuess.findMany({
      where: { taskId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  findActiveByMaintenanceId(
    maintenanceId: string,
  ): Promise<MaintenanceGuess[]> {
    return this.prisma.maintenanceGuess.findMany({
      where: { task: { maintenanceId, deletedAt: null }, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  create(data: Prisma.MaintenanceGuessCreateInput): Promise<MaintenanceGuess> {
    return this.prisma.maintenanceGuess.create({ data });
  }

  updateStatus(
    id: string,
    status: Prisma.MaintenanceGuessUpdateInput['status'],
    actorId: string,
  ): Promise<MaintenanceGuess> {
    return this.prisma.maintenanceGuess.update({
      where: { id, deletedAt: null },
      data: { status, updatedBy: actorId },
    });
  }

  softDelete(id: string, actorId: string): Promise<MaintenanceGuess> {
    const now = new Date();
    return this.prisma.maintenanceGuess.update({
      where: { id, deletedAt: null },
      data: {
        deletedAt: now,
        deletedBy: actorId,
        updatedAt: now,
        updatedBy: actorId,
      },
    });
  }
}
