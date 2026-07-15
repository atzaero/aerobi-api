import { MaintenanceTaskRepository } from '@/modules/tasks/repositories/maintenance-task.repository';

import type { DashboardRange } from '../../utils/date-range.util';
import { TasksStatsService } from './tasks.stats.service';

const range: DashboardRange = {
  fromMs: Date.UTC(2026, 0, 1),
  toMs: Date.UTC(2026, 0, 20),
  preset: 'custom',
};

describe('TasksStatsService', () => {
  let service: TasksStatsService;
  let findForDashboard: jest.Mock;

  beforeEach(() => {
    findForDashboard = jest.fn();
    service = new TasksStatsService({
      findForDashboard,
    } as unknown as MaintenanceTaskRepository);
  });

  it('agrega status/urgência (minúsculas), capex/opex e atrasadas', async () => {
    findForDashboard.mockResolvedValue([
      {
        status: 'PENDING',
        urgency: 'HIGH',
        investmentType: 'CAPEX',
        predictedValue: 100,
        delayWarning: true,
      },
      {
        status: 'COMPLETED',
        urgency: 'LOW',
        investmentType: 'OPEX',
        predictedValue: 50,
        delayWarning: false,
      },
      {
        status: 'PENDING',
        urgency: null,
        investmentType: 'CAPEX',
        predictedValue: 25,
        delayWarning: true,
      },
    ]);

    const result = await service.execute(['a-1'], range);

    expect(result.total).toEqual({ value: 3 });
    expect(result.byStatus).toEqual({ pending: 2, completed: 1 });
    expect(result.byUrgency).toEqual({ high: 1, low: 1 });
    expect(result.capexTotal).toBe(125);
    expect(result.opexTotal).toBe(50);
    expect(result.delayed).toBe(2);
  });
});
