import { Injectable } from '@nestjs/common';

import { TechnicalVisitRepository } from '@/modules/technical-visits/repositories/technical-visit.repository';

import type { TechnicalVisitsStatsDTO } from '../../dtos/dashboard-response.dto';
import { timeSeriesByPeriod } from '../../utils/aggregate.util';
import {
  bucketGranularity,
  type DashboardRange,
} from '../../utils/date-range.util';
import { countNonConformities } from '../../utils/non-conformity.util';

/**
 * Agregados de `technical-visits` escopados ao grupo e à faixa de tempo (por
 * `visitAt`): total, não-conformidades por item de inspeção (polaridade curada) e
 * série temporal. Compartilhado por admin/coordinator, operator e technical.
 */
@Injectable()
export class TechnicalVisitsStatsService {
  constructor(private readonly repo: TechnicalVisitRepository) {}

  async execute(
    aerodromeIds: string[] | null,
    range: DashboardRange,
  ): Promise<TechnicalVisitsStatsDTO> {
    const rows = await this.repo.findForDashboard(
      aerodromeIds,
      range.fromMs,
      range.toMs,
    );

    return {
      total: { value: rows.length },
      byInspectionType: countNonConformities(rows),
      series: timeSeriesByPeriod(
        rows,
        (v) => v.visitAtMs,
        bucketGranularity(range),
      ),
    };
  }
}
