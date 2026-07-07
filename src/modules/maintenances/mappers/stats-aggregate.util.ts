import {
  isTaskCurrentlyOverdue,
  isTaskDeliveredLate,
} from '@/modules/maintenances/utils/maintenance-domain.util';
import type { StatusBreakdown } from '@/modules/maintenances/dtos/maintenances-stats-response.dto';
import type {
  InvestmentType,
  TaskStatus,
  TaskUrgency,
} from '@/generated/prisma/client';

/** Entrada mínima de manutenção para agregação (só o aeródromo dono). */
export type MaintenanceAggregateRow = Pick<
  { aerodromeId: string },
  'aerodromeId'
>;

/** Entrada mínima de tarefa para agregação do minidashboard. */
export type TaskAggregateRow = {
  maintenanceId: string;
  aerodromeId: string;
  investmentType: InvestmentType | null;
  predictedValue: number;
  status: TaskStatus;
  predictedDate: Date | null;
  delayWarning: boolean | null;
  urgency: TaskUrgency | null;
};

export interface AggregateMaintenancesDashboardInput {
  scopeKind: 'all' | 'group' | 'none';
  aerodromesRegistered: number;
  maintenances: readonly MaintenanceAggregateRow[];
  tasks: readonly TaskAggregateRow[];
  nowMs?: number;
}

/** Percentuais do valor previsto: CAPEX/OPEX dividem o total tipado. */
export function buildInvestmentTypePercent(
  tasks: readonly TaskAggregateRow[],
): { capex: number; opex: number; unknown: number } {
  const { capex, opex } = sumPredictedValueByInvestmentType(tasks);
  let unknownValue = 0;

  for (const task of tasks) {
    if (!Number.isFinite(task.predictedValue)) continue;
    if (task.investmentType !== 'CAPEX' && task.investmentType !== 'OPEX') {
      unknownValue += task.predictedValue;
    }
  }

  const typedTotal = capex + opex;
  const grandTotal = typedTotal + unknownValue;

  if (typedTotal <= 0) {
    return {
      capex: 0,
      opex: 0,
      unknown: grandTotal > 0 ? 100 : 0,
    };
  }

  return {
    capex: Math.round((capex / typedTotal) * 100),
    opex: Math.round((opex / typedTotal) * 100),
    unknown: grandTotal > 0 ? Math.round((unknownValue / grandTotal) * 100) : 0,
  };
}

/** Contagem de tarefas por aeródromo (`aerodromeId` → total). */
export function countTasksByAerodrome(
  tasks: readonly TaskAggregateRow[],
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const task of tasks) {
    out[task.aerodromeId] = (out[task.aerodromeId] ?? 0) + 1;
  }
  return out;
}

/** Contagem por urgência; ignora tarefas sem urgência. */
export function countTasksByUrgency(
  tasks: readonly TaskAggregateRow[],
): StatusBreakdown {
  const out: StatusBreakdown = {};
  for (const task of tasks) {
    const key = task.urgency;
    if (key == null) continue;
    const apiKey = key.toLowerCase() as keyof StatusBreakdown;
    out[apiKey] = (out[apiKey] ?? 0) + 1;
  }
  return out;
}

/** Soma de `predictedValue` das tarefas no escopo. */
export function sumPredictedValue(tasks: readonly TaskAggregateRow[]): number {
  let total = 0;
  for (const task of tasks) {
    if (Number.isFinite(task.predictedValue)) {
      total += task.predictedValue;
    }
  }
  return total;
}

/** Soma de `predictedValue` por CAPEX/OPEX. */
export function sumPredictedValueByInvestmentType(
  tasks: readonly TaskAggregateRow[],
): { capex: number; opex: number } {
  let capex = 0;
  let opex = 0;

  for (const task of tasks) {
    if (!Number.isFinite(task.predictedValue)) continue;
    if (task.investmentType === 'CAPEX') capex += task.predictedValue;
    else if (task.investmentType === 'OPEX') opex += task.predictedValue;
  }

  return { capex, opex };
}

/**
 * Agrega o snapshot do minidashboard `/maintenances` a partir de listas já
 * escopadas (sem I/O).
 */
export function aggregateMaintenancesDashboard(
  input: AggregateMaintenancesDashboardInput,
): {
  meta: { scopeKind: 'all' | 'group' | 'none' };
  aerodromesRegistered: number;
  aerodromesWithMaintenance: number;
  investmentTypePercent: { capex: number; opex: number; unknown: number };
  predictedValueByInvestmentType: { capex: number; opex: number };
  totalPredictedValue: number;
  overduePending: number;
  overdueCompleted: number;
  byUrgency: StatusBreakdown;
  tasksByAerodrome: Record<string, number>;
} {
  const { scopeKind, aerodromesRegistered, maintenances, tasks, nowMs } = input;

  if (scopeKind === 'none') {
    return {
      meta: { scopeKind: 'none' },
      aerodromesRegistered: 0,
      aerodromesWithMaintenance: 0,
      investmentTypePercent: { capex: 0, opex: 0, unknown: 0 },
      predictedValueByInvestmentType: { capex: 0, opex: 0 },
      totalPredictedValue: 0,
      overduePending: 0,
      overdueCompleted: 0,
      byUrgency: {},
      tasksByAerodrome: {},
    };
  }

  const aerodromeIdsWithMaintenance = new Set(
    maintenances.map((m) => m.aerodromeId),
  );

  const now = nowMs ?? Date.now();
  const pendingOverdueMaintenanceIds = new Set<string>();
  const completedLateMaintenanceIds = new Set<string>();
  for (const task of tasks) {
    if (isTaskCurrentlyOverdue(task, now)) {
      pendingOverdueMaintenanceIds.add(task.maintenanceId);
    }
    if (isTaskDeliveredLate(task)) {
      completedLateMaintenanceIds.add(task.maintenanceId);
    }
  }

  return {
    meta: { scopeKind },
    aerodromesRegistered,
    aerodromesWithMaintenance: aerodromeIdsWithMaintenance.size,
    investmentTypePercent: buildInvestmentTypePercent(tasks),
    predictedValueByInvestmentType: sumPredictedValueByInvestmentType(tasks),
    totalPredictedValue: sumPredictedValue(tasks),
    overduePending: pendingOverdueMaintenanceIds.size,
    overdueCompleted: completedLateMaintenanceIds.size,
    byUrgency: countTasksByUrgency(tasks),
    tasksByAerodrome: countTasksByAerodrome(tasks),
  };
}
