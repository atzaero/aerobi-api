import type { MaintenanceGuess, Prisma } from '@/generated/prisma/client';

export type MaintenanceGuessWithTask = MaintenanceGuess & {
  task: { maintenanceId: string };
};

export interface IMaintenanceGuessRepository {
  findById(id: string): Promise<MaintenanceGuessWithTask | null>;
  findActiveByTaskId(taskId: string): Promise<MaintenanceGuess[]>;
  findActiveByMaintenanceId(maintenanceId: string): Promise<MaintenanceGuess[]>;
  create(data: Prisma.MaintenanceGuessCreateInput): Promise<MaintenanceGuess>;
  updateStatus(
    id: string,
    status: Prisma.MaintenanceGuessUpdateInput['status'],
    actorId: string,
  ): Promise<MaintenanceGuess>;
  softDelete(id: string, actorId: string): Promise<MaintenanceGuess>;
}
