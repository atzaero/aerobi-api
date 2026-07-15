import { Injectable } from '@nestjs/common';

import { MaintenanceTaskRepository } from '@/modules/tasks/repositories/maintenance-task.repository';

import type { TasksStatsDTO } from '../../dtos/dashboard-response.dto';
import { countByStatus, sumBy } from '../../utils/aggregate.util';
import type { DashboardRange } from '../../utils/date-range.util';

/**
 * Agregados de `tasks` (plano de negócios) escopados ao grupo e à faixa de tempo
 * (por `createdAt`): total, por situação, por urgência, totais CAPEX/OPEX
 * (`predictedValue`) e quantidade com aviso de atraso. Exclusivo do dashboard
 * admin/coordinator. Espelha `stats-tasks` do `aerobi-web`; chaves normalizadas
 * para minúsculas.
 */
@Injectable()
export class TasksStatsService {
  constructor(private readonly repo: MaintenanceTaskRepository) {}

  async execute(
    aerodromeIds: string[] | null,
    range: DashboardRange,
  ): Promise<TasksStatsDTO> {
    const rows = await this.repo.findForDashboard(
      aerodromeIds,
      range.fromMs,
      range.toMs,
    );

    return {
      total: { value: rows.length },
      byStatus: countByStatus(rows, (t) => t.status.toLowerCase()),
      byUrgency: countByStatus(rows, (t) => t.urgency?.toLowerCase()),
      capexTotal: sumBy(
        rows.filter((t) => t.investmentType === 'CAPEX'),
        (t) => t.predictedValue,
      ),
      opexTotal: sumBy(
        rows.filter((t) => t.investmentType === 'OPEX'),
        (t) => t.predictedValue,
      ),
      delayed: rows.reduce(
        (acc, t) => acc + (t.delayWarning === true ? 1 : 0),
        0,
      ),
    };
  }
}
