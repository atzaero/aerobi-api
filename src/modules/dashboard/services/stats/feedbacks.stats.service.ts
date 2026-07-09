import { Injectable } from '@nestjs/common';

import { FeedbackRepository } from '@/modules/feedbacks/repositories/feedback.repository';

import type { FeedbacksStatsDTO } from '../../dtos/dashboard-response.dto';
import { countByStatus } from '../../utils/aggregate.util';
import type { DashboardRange } from '../../utils/date-range.util';

/**
 * Agregados de `feedbacks` escopados ao grupo e à faixa de tempo (por
 * `createdAt`): total e contagem por avaliação (`positive`/`negative`). Espelha
 * `stats-feedbacks` do `aerobi-web`; chaves normalizadas para minúsculas.
 */
@Injectable()
export class FeedbacksStatsService {
  constructor(private readonly repo: FeedbackRepository) {}

  async execute(
    aerodromeIds: string[] | null,
    range: DashboardRange,
  ): Promise<FeedbacksStatsDTO> {
    const rows = await this.repo.findForDashboard(
      aerodromeIds,
      range.fromMs,
      range.toMs,
    );

    return {
      total: { value: rows.length },
      byRating: countByStatus(rows, (f) => f.rating.toLowerCase()),
    };
  }
}
