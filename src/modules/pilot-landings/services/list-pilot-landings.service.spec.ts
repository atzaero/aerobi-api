import type { PilotLandingRepository } from '../repositories/pilot-landing.repository';
import { buildPilotLandingFixture } from '../testing/pilot-landing.entity.fixture';

import { ListPilotLandingsService } from './list-pilot-landings.service';

describe('ListPilotLandingsService', () => {
  let service: ListPilotLandingsService;
  let findMany: jest.Mock;
  let count: jest.Mock;

  beforeEach(() => {
    findMany = jest.fn();
    count = jest.fn();
    const repo = {
      findMany,
      count,
    } as unknown as PilotLandingRepository;
    service = new ListPilotLandingsService(repo);
  });

  it('sem filtros usa where vazio e paginação por defeito', async () => {
    findMany.mockResolvedValue([]);
    count.mockResolvedValue(0);

    await service.execute({});

    expect(findMany).toHaveBeenCalledWith({}, 0, 10);
    expect(count).toHaveBeenCalledWith({});
  });

  it('aplica filtro operationalAerodromeId', async () => {
    const aerodromeId = '22222222-2222-4222-8222-222222222222';
    findMany.mockResolvedValue([]);
    count.mockResolvedValue(0);

    await service.execute({ operationalAerodromeId: aerodromeId });

    const expectedWhere = { operationalAerodromeId: aerodromeId };
    expect(findMany).toHaveBeenCalledWith(expectedWhere, 0, 10);
    expect(count).toHaveBeenCalledWith(expectedWhere);
  });

  it('registration usa contains mode insensitive', async () => {
    findMany.mockResolvedValue([]);
    count.mockResolvedValue(0);

    await service.execute({ registration: 'PT-' });

    const expectedWhere = {
      registration: { contains: 'PT-', mode: 'insensitive' },
    };
    expect(findMany).toHaveBeenCalledWith(expectedWhere, 0, 10);
    expect(count).toHaveBeenCalledWith(expectedWhere);
  });

  it('combina filtros e skip na página 2', async () => {
    const aerodromeId = '22222222-2222-4222-8222-222222222222';
    const rows = [buildPilotLandingFixture()];
    findMany.mockResolvedValue(rows);
    count.mockResolvedValue(25);

    const out = await service.execute({
      page: 2,
      limit: 10,
      operationalAerodromeId: aerodromeId,
      registration: 'abc',
    });

    const expectedWhere = {
      operationalAerodromeId: aerodromeId,
      registration: { contains: 'abc', mode: 'insensitive' },
    };
    expect(findMany).toHaveBeenCalledWith(expectedWhere, 10, 10);
    expect(count).toHaveBeenCalledWith(expectedWhere);
    expect(out.meta.currentPage).toBe(2);
    expect(out.meta.totalItems).toBe(25);
    expect(out.data).toHaveLength(1);
    expect(out.data[0].id).toBe(rows[0].id);
  });
});
