import type { MaintenanceTask, Prisma } from '@/generated/prisma/client';

export interface IMaintenanceTaskRepository {
  create(data: Prisma.MaintenanceTaskCreateInput): Promise<MaintenanceTask>;
  update(
    id: string,
    data: Prisma.MaintenanceTaskUpdateInput,
  ): Promise<MaintenanceTask>;
  findById(id: string): Promise<MaintenanceTask | null>;
  findManyByMaintenanceId(maintenanceId: string): Promise<MaintenanceTask[]>;
  countActiveGuessesByTaskIds(
    taskIds: readonly string[],
  ): Promise<Map<string, number>>;
  findTasksForMaintenanceIds(
    maintenanceIds: readonly string[],
  ): Promise<
    Pick<
      MaintenanceTask,
      'id' | 'maintenanceId' | 'status' | 'predictedDate' | 'delayWarning'
    >[]
  >;
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
  >;
  softDelete(
    id: string,
    actorId: string,
  ): Promise<{ task: MaintenanceTask; deletedGuesses: number }>;
}
