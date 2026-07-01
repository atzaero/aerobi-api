import { GeojsonStatus } from '@/generated/prisma/client';

import type { GeojsonRepository } from '../repositories/geojson.repository';
import { buildGeojsonFixture } from '../testing/geojson.entity.fixture';

import { ListGeojsonsService } from './list-geojsons.service';

describe('ListGeojsonsService', () => {
  let service: ListGeojsonsService;
  let findMany: jest.Mock;
  let count: jest.Mock;

  beforeEach(() => {
    findMany = jest.fn();
    count = jest.fn();
    const repo = {
      findMany,
      count,
    } as unknown as GeojsonRepository;
    service = new ListGeojsonsService(repo);
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
      status: GeojsonStatus.ERROR,
    });
    const w = {
      aerodromeId: aid,
      status: GeojsonStatus.ERROR,
    };
    expect(findMany).toHaveBeenCalledWith(w, 0, 10);
    expect(count).toHaveBeenCalledWith(w);
  });

  it('paginação', async () => {
    const row = buildGeojsonFixture();
    findMany.mockResolvedValue([row]);
    count.mockResolvedValue(4);
    const out = await service.execute({ page: 2, limit: 2 });
    expect(findMany).toHaveBeenCalledWith({}, 2, 2);
    expect(out.data[0].id).toBe(row.id);
  });
});
