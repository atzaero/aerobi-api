import { Injectable } from '@nestjs/common';

import type { AdminDashboardDTO } from '../../dtos/dashboard-response.dto';
import { buildDashboardMeta } from '../../mappers/dashboard.mapper';
import type { DashboardBuildContext } from '../builder-types';
import { AerodromesStatsService } from '../stats/aerodromes.stats.service';
import { FeedbacksStatsService } from '../stats/feedbacks.stats.service';
import { LandingRequestsStatsService } from '../stats/landing-requests.stats.service';
import { TasksStatsService } from '../stats/tasks.stats.service';
import { TechnicalVisitsStatsService } from '../stats/technical-visits.stats.service';

/**
 * Builder do dashboard de **admin** e **coordinator** — mesma tela; a única
 * diferença é o escopo já resolvido (admin=`all`, coordinator=`group`). Compõe
 * todos os blocos em paralelo (inclui `tasks`).
 */
@Injectable()
export class BuildAdminDashboardService {
  constructor(
    private readonly landingRequests: LandingRequestsStatsService,
    private readonly technicalVisits: TechnicalVisitsStatsService,
    private readonly aerodromes: AerodromesStatsService,
    private readonly feedbacks: FeedbacksStatsService,
    private readonly tasks: TasksStatsService,
  ) {}

  async build(ctx: DashboardBuildContext): Promise<AdminDashboardDTO> {
    const { role, scope, range } = ctx;
    const { aerodromeIds } = scope;

    const [landingRequests, technicalVisits, aerodromes, feedbacks, tasks] =
      await Promise.all([
        this.landingRequests.execute(aerodromeIds, range),
        this.technicalVisits.execute(aerodromeIds, range),
        this.aerodromes.execute(aerodromeIds),
        this.feedbacks.execute(aerodromeIds, range),
        this.tasks.execute(aerodromeIds, range),
      ]);

    return {
      meta: buildDashboardMeta(role, scope.scopeKind, range),
      landingRequests,
      technicalVisits,
      aerodromes,
      feedbacks,
      tasks,
    };
  }
}
