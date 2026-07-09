import { Injectable } from '@nestjs/common';

import type { OperatorDashboardDTO } from '../../dtos/dashboard-response.dto';
import { buildDashboardMeta } from '../../mappers/dashboard.mapper';
import type { DashboardBuildContext } from '../builder-types';
import { AerodromesStatsService } from '../stats/aerodromes.stats.service';
import { FeedbacksStatsService } from '../stats/feedbacks.stats.service';
import { LandingRequestsStatsService } from '../stats/landing-requests.stats.service';
import { TechnicalVisitsStatsService } from '../stats/technical-visits.stats.service';

/**
 * Builder do dashboard de **operator**: como o admin, mas **sem o bloco
 * `tasks`** (recorte por papel espelhando o `aerobi-web`).
 */
@Injectable()
export class BuildOperatorDashboardService {
  constructor(
    private readonly landingRequests: LandingRequestsStatsService,
    private readonly technicalVisits: TechnicalVisitsStatsService,
    private readonly aerodromes: AerodromesStatsService,
    private readonly feedbacks: FeedbacksStatsService,
  ) {}

  async build(ctx: DashboardBuildContext): Promise<OperatorDashboardDTO> {
    const { role, scope, range } = ctx;
    const { aerodromeIds } = scope;

    const [landingRequests, technicalVisits, aerodromes, feedbacks] =
      await Promise.all([
        this.landingRequests.execute(aerodromeIds, range),
        this.technicalVisits.execute(aerodromeIds, range),
        this.aerodromes.execute(aerodromeIds),
        this.feedbacks.execute(aerodromeIds, range),
      ]);

    return {
      meta: buildDashboardMeta(role, scope.scopeKind, range),
      landingRequests,
      technicalVisits,
      aerodromes,
      feedbacks,
    };
  }
}
