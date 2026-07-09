import { FeedbackRepository } from '@/modules/feedbacks/repositories/feedback.repository';

import type { DashboardRange } from '../../utils/date-range.util';
import { FeedbacksStatsService } from './feedbacks.stats.service';

const range: DashboardRange = {
  fromMs: Date.UTC(2026, 0, 1),
  toMs: Date.UTC(2026, 0, 20),
  preset: 'custom',
};

describe('FeedbacksStatsService', () => {
  let service: FeedbacksStatsService;
  let findForDashboard: jest.Mock;

  beforeEach(() => {
    findForDashboard = jest.fn();
    service = new FeedbacksStatsService({
      findForDashboard,
    } as unknown as FeedbackRepository);
  });

  it('normaliza byRating para minúsculas', async () => {
    findForDashboard.mockResolvedValue([
      { rating: 'POSITIVE' },
      { rating: 'POSITIVE' },
      { rating: 'NEGATIVE' },
    ]);

    const result = await service.execute(null, range);

    expect(result.total).toEqual({ value: 3 });
    expect(result.byRating).toEqual({ positive: 2, negative: 1 });
  });
});
