import type { Maintenance, MaintenanceTask } from '@/generated/prisma/client';

import {
  isTaskCurrentlyOverdue,
  isTaskDeliveredLate,
} from './maintenance-domain.util';

/** Contagem de tarefas em atraso por intervenção. */
export function countOverdueByMaintenance(
  tasks: readonly Pick<
    MaintenanceTask,
    'maintenanceId' | 'status' | 'predictedDate' | 'delayWarning'
  >[],
  nowMs?: number,
): Map<string, { overduePendingCount: number; overdueCompletedCount: number }> {
  const out = new Map<
    string,
    { overduePendingCount: number; overdueCompletedCount: number }
  >();

  for (const task of tasks) {
    const current = out.get(task.maintenanceId) ?? {
      overduePendingCount: 0,
      overdueCompletedCount: 0,
    };
    if (isTaskCurrentlyOverdue(task, nowMs)) {
      current.overduePendingCount += 1;
    }
    if (isTaskDeliveredLate(task)) {
      current.overdueCompletedCount += 1;
    }
    out.set(task.maintenanceId, current);
  }

  return out;
}

/** Anexa contagem de atraso a cada intervenção da listagem. */
export function enrichMaintenanceListItems<
  T extends Maintenance & { aerodrome: { group: { uf: string } } },
>(
  plans: readonly T[],
  tasks: readonly Pick<
    MaintenanceTask,
    'maintenanceId' | 'status' | 'predictedDate' | 'delayWarning'
  >[],
  nowMs?: number,
): Array<
  T & { overduePendingCount: number; overdueCompletedCount: number; uf: string }
> {
  const counts = countOverdueByMaintenance(tasks, nowMs);
  return plans.map((plan) => {
    const c = counts.get(plan.id) ?? {
      overduePendingCount: 0,
      overdueCompletedCount: 0,
    };
    return {
      ...plan,
      uf: plan.aerodrome.group.uf,
      ...c,
    };
  });
}
