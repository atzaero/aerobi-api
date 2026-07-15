import { AerodromeRepository } from '@/modules/aerodromes/repositories/aerodrome.repository';

import { AerodromesStatsService } from './aerodromes.stats.service';

describe('AerodromesStatsService', () => {
  let service: AerodromesStatsService;
  let findForDashboardSnapshot: jest.Mock;

  beforeEach(() => {
    findForDashboardSnapshot = jest.fn();
    service = new AerodromesStatsService({
      findForDashboardSnapshot,
    } as unknown as AerodromeRepository);
  });

  it('conta o snapshot por flag (null/false não contam)', async () => {
    findForDashboardSnapshot.mockResolvedValue([
      {
        isOpen: true,
        isView: true,
        construction: null,
        lit: true,
        fueling: false,
      },
      {
        isOpen: false,
        isView: true,
        construction: true,
        lit: null,
        fueling: true,
      },
    ]);

    const result = await service.execute(['a-1', 'a-2']);

    expect(result).toEqual({
      total: 2,
      open: 1,
      view: 2,
      construction: 1,
      lit: 1,
      fueling: 1,
    });
    expect(findForDashboardSnapshot).toHaveBeenCalledWith(['a-1', 'a-2']);
  });

  it('escopo vazio → tudo zero', async () => {
    findForDashboardSnapshot.mockResolvedValue([]);

    const result = await service.execute([]);

    expect(result).toEqual({
      total: 0,
      open: 0,
      view: 0,
      construction: 0,
      lit: 0,
      fueling: 0,
    });
  });
});
