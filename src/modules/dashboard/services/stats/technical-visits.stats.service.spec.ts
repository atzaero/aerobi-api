import { TechnicalVisitRepository } from '@/modules/technical-visits/repositories/technical-visit.repository';

import type { DashboardRange } from '../../utils/date-range.util';
import { TechnicalVisitsStatsService } from './technical-visits.stats.service';

const range: DashboardRange = {
  fromMs: Date.UTC(2026, 0, 1),
  toMs: Date.UTC(2026, 0, 20),
  preset: 'custom',
};

/** Visita conforme, exceto os flags sobrescritos. */
const visit = (over: Record<string, unknown>) => ({
  visitAtMs: Date.UTC(2026, 0, 3),
  hasGatesPadlocks: true,
  hasFence: true,
  hasStandardPlate: true,
  hasQualityHoles: false,
  hasHorizontalSignage: true,
  hasUnobstructedHeadboards: true,
  pavementRegularity: true,
  hasTrashDebris: false,
  hasDelimitedPerimeter: true,
  hasInvasion: false,
  ...over,
});

describe('TechnicalVisitsStatsService', () => {
  let service: TechnicalVisitsStatsService;
  let findForDashboard: jest.Mock;

  beforeEach(() => {
    findForDashboard = jest.fn();
    service = new TechnicalVisitsStatsService({
      findForDashboard,
    } as unknown as TechnicalVisitRepository);
  });

  it('agrega total, não-conformidades e série por visitAt', async () => {
    findForDashboard.mockResolvedValue([
      visit({ hasFence: false }),
      visit({ hasInvasion: true, visitAtMs: Date.UTC(2026, 0, 4) }),
    ]);

    const result = await service.execute(null, range);

    expect(result.total).toEqual({ value: 2 });
    expect(result.byInspectionType).toEqual({ sem_cerca: 1, invasao: 1 });
    expect(result.series.granularity).toBe('day');
    expect(result.series.points).toEqual([
      { bucket: Date.UTC(2026, 0, 3), count: 1 },
      { bucket: Date.UTC(2026, 0, 4), count: 1 },
    ]);
  });
});
