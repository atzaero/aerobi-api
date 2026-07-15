import type { MaintenanceTask } from '@/generated/prisma/client';

import type { TaskFilterQueryDTO } from '../dtos/list-tasks-query.dto';

import {
  filterMaintenanceTasks,
  sortMaintenanceTasks,
} from './filter-maintenance-tasks';

/**
 * MaintenanceTask mínimo para os filtros; `predictedValue` expõe só o
 * `toNumber()` usado pelo filtro (Decimal do Prisma).
 */
function task(
  overrides: Partial<Record<string, unknown>> = {},
): MaintenanceTask {
  return {
    id: 'task-1',
    status: 'PENDING',
    urgency: null,
    followUp: null,
    investmentType: null,
    title: 'Trocar lâmpadas',
    description: 'Pátio',
    predictedValue: { toNumber: () => 1500.5 },
    predictedDate: new Date(2026, 1, 1),
    createdAt: new Date(2026, 0, 1),
    ...overrides,
  } as unknown as MaintenanceTask;
}

const noCounts = new Map<string, number>();

function run(
  tasks: MaintenanceTask[],
  filters: Partial<TaskFilterQueryDTO>,
): MaintenanceTask[] {
  return filterMaintenanceTasks(tasks, filters, noCounts);
}

describe('filterMaintenanceTasks — predictedDate (dia civil local)', () => {
  it('casa quando o dia civil local bate com o filtro yyyy-MM-dd', () => {
    const tasks = [task({ id: 'a', predictedDate: new Date(2026, 1, 1) })];
    expect(run(tasks, { predictedDate: '2026-02-01' })).toHaveLength(1);
  });

  it('não casa outro dia', () => {
    const tasks = [task({ id: 'a', predictedDate: new Date(2026, 1, 1) })];
    expect(run(tasks, { predictedDate: '2026-02-02' })).toHaveLength(0);
  });
});

describe('filterMaintenanceTasks — predictedValue (pt-BR, igualdade numérica)', () => {
  const tasks = [task({ id: 'a', predictedValue: { toNumber: () => 1500.5 } })];

  it('aceita separador pt-BR com milhar (1.500,50)', () => {
    expect(run(tasks, { predictedValue: '1.500,50' })).toHaveLength(1);
  });

  it('aceita decimal pt-BR sem milhar (1500,50)', () => {
    expect(run(tasks, { predictedValue: '1500,50' })).toHaveLength(1);
  });

  it('trata ponto como separador de milhar (1.500 = 1500)', () => {
    const t = [task({ id: 'b', predictedValue: { toNumber: () => 1500 } })];
    expect(run(t, { predictedValue: '1.500' })).toHaveLength(1);
  });

  it('não casa texto não-numérico', () => {
    expect(run(tasks, { predictedValue: 'abc' })).toHaveLength(0);
  });

  it('não casa valor diferente', () => {
    expect(run(tasks, { predictedValue: '2000,00' })).toHaveLength(0);
  });
});

describe('sortMaintenanceTasks', () => {
  it('ordena por urgência (rank), depois predictedDate, depois createdAt desc', () => {
    const low = task({
      id: 'low',
      urgency: 'LOW',
      predictedDate: new Date(2026, 0, 10),
    });
    const critical = task({
      id: 'critical',
      urgency: 'CRITICAL',
      predictedDate: new Date(2026, 0, 20),
    });
    const sorted = sortMaintenanceTasks([low, critical]);
    expect(sorted.map((t) => t.id)).toEqual(['critical', 'low']);
  });
});
