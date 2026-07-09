import { Injectable } from '@nestjs/common';

import { LandingRequestRepository } from '@/modules/landing-requests/repositories/landing-request.repository';

import type { LandingRequestsStatsDTO } from '../../dtos/dashboard-response.dto';
import {
  averageOrNull,
  countByStatus,
  timeSeriesByPeriod,
} from '../../utils/aggregate.util';
import {
  bucketGranularity,
  type DashboardRange,
} from '../../utils/date-range.util';

/**
 * Agregados de `landing-requests` escopados ao grupo e à faixa de tempo (por
 * `requestDate`): total, por situação, série temporal e tempo médio de resposta
 * (`reviewedAt − requestDate`). Espelha `stats-landing-requests` do `aerobi-web`;
 * chaves de `byStatus` normalizadas para minúsculas (paridade de contrato).
 */
@Injectable()
export class LandingRequestsStatsService {
  constructor(private readonly repo: LandingRequestRepository) {}

  async execute(
    aerodromeIds: string[] | null,
    range: DashboardRange,
  ): Promise<LandingRequestsStatsDTO> {
    const rows = await this.repo.findForDashboard(
      aerodromeIds,
      range.fromMs,
      range.toMs,
    );

    const responseTimes = rows
      .filter(
        (r): r is typeof r & { reviewedAtMs: number } => r.reviewedAtMs != null,
      )
      .map((r) => r.reviewedAtMs - r.requestDateMs);

    return {
      total: { value: rows.length },
      byStatus: countByStatus(rows, (r) => r.status.toLowerCase()),
      series: timeSeriesByPeriod(
        rows,
        (r) => r.requestDateMs,
        bucketGranularity(range),
      ),
      avgResponseMs: averageOrNull(responseTimes),
    };
  }
}
