import { Injectable } from '@nestjs/common';

import type { TechnicalDashboardDTO } from '../../dtos/dashboard-response.dto';
import { buildDashboardMeta } from '../../mappers/dashboard.mapper';
import type { DashboardBuildContext } from '../builder-types';
import { AerodromesStatsService } from '../stats/aerodromes.stats.service';
import { TechnicalVisitsStatsService } from '../stats/technical-visits.stats.service';

/**
 * Builder do dashboard de **technical**: recorte mais enxuto — só
 * `technicalVisits` + `aerodromes` (espelha o `aerobi-web`).
 */
@Injectable()
export class BuildTechnicalDashboardService {
  constructor(
    private readonly technicalVisits: TechnicalVisitsStatsService,
    private readonly aerodromes: AerodromesStatsService,
  ) {}

  async build(ctx: DashboardBuildContext): Promise<TechnicalDashboardDTO> {
    const { role, scope, range } = ctx;
    const { aerodromeIds } = scope;

    const [technicalVisits, aerodromes] = await Promise.all([
      this.technicalVisits.execute(aerodromeIds, range),
      this.aerodromes.execute(aerodromeIds),
    ]);

    return {
      meta: buildDashboardMeta(role, scope.scopeKind, range),
      technicalVisits,
      aerodromes,
    };
  }
}
