import type { Maintenance, MaintenanceTask } from '@/generated/prisma/client';
import { TaskStatus } from '@/generated/prisma/client';

import {
  countOverdueByMaintenance,
  enrichMaintenanceListItems,
} from './enrich-maintenance-list';

/** Instante fixo e datas determinísticas para o cálculo de atraso. */
const NOW = Date.parse('2026-06-01T12:00:00.000Z');
const PAST = new Date('2020-01-01T00:00:00.000Z');
const FUTURE = new Date('2030-01-01T00:00:00.000Z');

type OverdueTask = Pick<
  MaintenanceTask,
  'maintenanceId' | 'status' | 'predictedDate' | 'delayWarning'
>;

type Plan = Maintenance & { aerodrome: { group: { uf: string } } };

describe('countOverdueByMaintenance', () => {
  it('separa pendentes vencidas de concluídas em atraso por intervenção', () => {
    const tasks: OverdueTask[] = [
      {
        maintenanceId: 'm1',
        status: TaskStatus.PENDING,
        predictedDate: PAST,
        delayWarning: null,
      },
      {
        maintenanceId: 'm1',
        status: TaskStatus.COMPLETED,
        predictedDate: PAST,
        delayWarning: true,
      },
      {
        maintenanceId: 'm2',
        status: TaskStatus.PENDING,
        predictedDate: FUTURE,
        delayWarning: null,
      },
    ];

    const counts = countOverdueByMaintenance(tasks, NOW);

    expect(counts.get('m1')).toEqual({
      overduePendingCount: 1,
      overdueCompletedCount: 1,
    });
    expect(counts.get('m2')).toEqual({
      overduePendingCount: 0,
      overdueCompletedCount: 0,
    });
  });
});

describe('enrichMaintenanceListItems', () => {
  const planM1 = {
    id: 'm1',
    name: 'Plano',
    aerodromeId: 'a1',
    aerodrome: { group: { uf: 'PI' } },
  } as unknown as Plan;
  const planM2 = {
    id: 'm2',
    name: 'Sem tarefas',
    aerodromeId: 'a2',
    aerodrome: { group: { uf: 'SP' } },
  } as unknown as Plan;

  it('anexa uf do grupo e contagem de atraso a cada intervenção', () => {
    const tasks: OverdueTask[] = [
      {
        maintenanceId: 'm1',
        status: TaskStatus.PENDING,
        predictedDate: PAST,
        delayWarning: null,
      },
    ];

    const result = enrichMaintenanceListItems([planM1, planM2], tasks, NOW);

    expect(result[0]).toMatchObject({
      id: 'm1',
      uf: 'PI',
      overduePendingCount: 1,
      overdueCompletedCount: 0,
    });
    expect(result[1]).toMatchObject({
      id: 'm2',
      uf: 'SP',
      overduePendingCount: 0,
      overdueCompletedCount: 0,
    });
  });
});
