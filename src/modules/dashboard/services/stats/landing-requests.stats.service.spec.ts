import { LandingRequestRepository } from '@/modules/landing-requests/repositories/landing-request.repository';

import type { DashboardRange } from '../../utils/date-range.util';
import { LandingRequestsStatsService } from './landing-requests.stats.service';

const DAY = 24 * 60 * 60 * 1000;
const range: DashboardRange = {
  fromMs: Date.UTC(2026, 0, 1),
  toMs: Date.UTC(2026, 0, 20),
  preset: 'custom',
};

describe('LandingRequestsStatsService', () => {
  let service: LandingRequestsStatsService;
  let findForDashboard: jest.Mock;

  beforeEach(() => {
    findForDashboard = jest.fn();
    service = new LandingRequestsStatsService({
      findForDashboard,
    } as unknown as LandingRequestRepository);
  });

  it('normaliza byStatus para minúsculas, calcula série e avgResponseMs', async () => {
    findForDashboard.mockResolvedValue([
      {
        requestDateMs: Date.UTC(2026, 0, 2),
        reviewedAtMs: Date.UTC(2026, 0, 3),
        status: 'APPROVED',
      },
      {
        requestDateMs: Date.UTC(2026, 0, 2),
        reviewedAtMs: null,
        status: 'PENDING',
      },
      {
        requestDateMs: Date.UTC(2026, 0, 5),
        reviewedAtMs: Date.UTC(2026, 0, 6),
        status: 'APPROVED',
      },
    ]);

    const result = await service.execute(['a-1'], range);

    expect(result.total).toEqual({ value: 3 });
    expect(result.byStatus).toEqual({ approved: 2, pending: 1 });
    expect(result.avgResponseMs).toBe(DAY);
    expect(result.series.granularity).toBe('day');
    expect(result.series.points).toEqual([
      { bucket: Date.UTC(2026, 0, 2), count: 2 },
      { bucket: Date.UTC(2026, 0, 5), count: 1 },
    ]);
    expect(findForDashboard).toHaveBeenCalledWith(
      ['a-1'],
      range.fromMs,
      range.toMs,
    );
  });

  it('sem respondidas → avgResponseMs null', async () => {
    findForDashboard.mockResolvedValue([
      {
        requestDateMs: Date.UTC(2026, 0, 2),
        reviewedAtMs: null,
        status: 'PENDING',
      },
    ]);

    const result = await service.execute(null, range);

    expect(result.avgResponseMs).toBeNull();
  });
});
