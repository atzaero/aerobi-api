import type { MaintenanceTask, Prisma } from '@/generated/prisma/client';

/**
 * Linha mínima de tarefa para o dashboard admin/coordinator. `predictedValue` já
 * convertido de `Decimal` para `number` pelo repositório.
 */
export interface MaintenanceTaskDashboardRow {
  status: MaintenanceTask['status'];
  urgency: MaintenanceTask['urgency'];
  investmentType: MaintenanceTask['investmentType'];
  predictedValue: number;
  delayWarning: MaintenanceTask['delayWarning'];
}

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
  /**
   * Linhas mínimas para o dashboard admin/coordinator: filtradas por escopo
   * (`aerodromeIds` `null` = sem filtro; `[]` = nenhuma, via relação
   * `maintenance.aerodromeId`) e por `createdAt` no intervalo `[fromMs, toMs]`.
   *
   * Faixa por `createdAt` (não-nulável, `@default(now())`) — é o campo primário do
   * `taskDashboardTimestamp` do `aerobi-web` (`createdAt ?? insertionDate`); o
   * fallback `insertionDate` do web só cobre docs Firestore sem `created_at`, caso
   * que não existe na API onde `createdAt` está sempre preenchido.
   */
  findForDashboard(
    aerodromeIds: readonly string[] | null,
    fromMs: number,
    toMs: number,
  ): Promise<MaintenanceTaskDashboardRow[]>;

  softDelete(
    id: string,
    actorId: string,
  ): Promise<{ task: MaintenanceTask; deletedGuesses: number }>;
}
