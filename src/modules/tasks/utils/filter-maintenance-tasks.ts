import type { MaintenanceTask } from '@/generated/prisma/client';

import {
  investmentTypeFromApi,
  taskFollowUpFromApi,
  taskStatusFromApi,
  taskUrgencyFromApi,
} from '../mappers/maintenance-task.prisma.mapper';
import {
  isTaskCurrentlyOverdue,
  isTaskDeliveredLate,
} from '@/modules/maintenances/utils/maintenance-domain.util';
import { toLocalCivilDate } from '@/common/utils/civil-date.util';
import type { TaskFilterQueryDTO } from '../dtos/list-tasks-query.dto';

const URGENCY_RANK: Record<string, number> = {
  CRITICAL: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};

/**
 * Igualdade numérica do valor previsto tolerando separador de milhar/decimal
 * pt-BR (`1.500,50`); texto não-numérico não casa nada. Espelha o
 * `matchesPredictedValueFilter` do aerobi-web.
 */
function matchesPredictedValueFilter(
  taskValue: number,
  filter: string,
): boolean {
  const trimmed = filter.trim();
  if (!trimmed) return true;
  const normalized = trimmed.replace(/\./g, '').replace(',', '.');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) && taskValue === parsed;
}

/**
 * Aplica filtros de listagem de tarefas em memória (paridade com o web).
 */
export function filterMaintenanceTasks(
  tasks: MaintenanceTask[],
  filters: TaskFilterQueryDTO,
  suggestionCounts: Map<string, number>,
): MaintenanceTask[] {
  let out = tasks;

  if (filters.situation) {
    out = out.filter((task) => {
      switch (filters.situation) {
        case 'pending':
        case 'completed':
          return task.status === taskStatusFromApi(filters.situation);
        case 'overdue':
          return isTaskCurrentlyOverdue(task);
        case 'completed_late':
          return isTaskDeliveredLate(task);
        default:
          return true;
      }
    });
  }

  if (filters.urgency) {
    const prismaUrgency = taskUrgencyFromApi(filters.urgency);
    out = out.filter((task) => task.urgency === prismaUrgency);
  }

  if (filters.search) {
    const term = filters.search.trim().toLowerCase();
    out = out.filter((task) =>
      [task.title, task.description].join(' ').toLowerCase().includes(term),
    );
  }

  if (filters.hasSuggestions === true) {
    out = out.filter((task) => (suggestionCounts.get(task.id) ?? 0) > 0);
  } else if (filters.hasSuggestions === false) {
    out = out.filter((task) => (suggestionCounts.get(task.id) ?? 0) === 0);
  }

  if (filters.followUp) {
    const prismaFollowUp = taskFollowUpFromApi(filters.followUp);
    out = out.filter((task) => task.followUp === prismaFollowUp);
  }

  if (filters.investmentType) {
    const prismaType = investmentTypeFromApi(filters.investmentType);
    out = out.filter((task) => task.investmentType === prismaType);
  }

  if (filters.predictedDate) {
    out = out.filter(
      (task) => toLocalCivilDate(task.predictedDate) === filters.predictedDate,
    );
  }

  if (filters.predictedValue) {
    out = out.filter((task) =>
      matchesPredictedValueFilter(
        task.predictedValue.toNumber(),
        filters.predictedValue as string,
      ),
    );
  }

  return out;
}

/** Ordena por urgência, data prevista e criação (paridade web). */
export function sortMaintenanceTasks(
  tasks: MaintenanceTask[],
): MaintenanceTask[] {
  return [...tasks].sort(
    (a, b) =>
      (URGENCY_RANK[a.urgency ?? ''] ?? 4) -
        (URGENCY_RANK[b.urgency ?? ''] ?? 4) ||
      a.predictedDate.getTime() - b.predictedDate.getTime() ||
      b.createdAt.getTime() - a.createdAt.getTime(),
  );
}
