import { AerodromeGeojsonStatus } from '@/generated/prisma/client';

import type { AerodromeGeojsonRepository } from '../repositories/aerodrome-geojson.repository';
import { buildAerodromeGeojsonFixture } from '../testing/aerodrome-geojson.entity.fixture';

import { ListAerodromeGeojsonsService } from './list-aerodrome-geojsons.service';

describe('ListAerodromeGeojsonsService', () => {
  let service: ListAerodromeGeojsonsService;
  let findMany: jest.Mock;
  let count: jest.Mock;

  beforeEach(() => {
    findMany = jest.fn();
    count = jest.fn();
    const repo = {
      findMany,
      count,
    } as unknown as AerodromeGeojsonRepository;
    service = new ListAerodromeGeojsonsService(repo);
  });

  const aid = '22222222-2222-4222-8222-222222222222';

  it('where vazio', async () => {
    findMany.mockResolvedValue([]);
    count.mockResolvedValue(0);
    await service.execute({});
    expect(findMany).toHaveBeenCalledWith({}, 0, 10);
  });

  it('aerodromeId e status', async () => {
    findMany.mockResolvedValue([]);
    count.mockResolvedValue(0);
    await service.execute({
      aerodromeId: aid,
      status: AerodromeGeojsonStatus.ERROR,
    });
    const w = {
      aerodromeId: aid,
      status: AerodromeGeojsonStatus.ERROR,
    };
    expect(findMany).toHaveBeenCalledWith(w, 0, 10);
    expect(count).toHaveBeenCalledWith(w);
  });

  it('paginação', async () => {
    const row = buildAerodromeGeojsonFixture();
    findMany.mockResolvedValue([row]);
    count.mockResolvedValue(4);
    const out = await service.execute({ page: 2, limit: 2 });
    expect(findMany).toHaveBeenCalledWith({}, 2, 2);
    expect(out.data[0].id).toBe(row.id);
  });
});
