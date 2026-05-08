import { Uf } from '@/generated/prisma/client';

import type { AerodromeGroupRepository } from '../repositories/aerodrome-group.repository';
import { buildAerodromeGroupFixture } from '../testing/aerodrome-group.entity.fixture';

import { ListAerodromeGroupsService } from './list-aerodrome-groups.service';

describe('ListAerodromeGroupsService', () => {
  let service: ListAerodromeGroupsService;
  let findMany: jest.Mock;
  let count: jest.Mock;

  beforeEach(() => {
    findMany = jest.fn();
    count = jest.fn();
    const repo = { findMany, count } as unknown as AerodromeGroupRepository;
    service = new ListAerodromeGroupsService(repo);
  });

  it('where vazio quando sem uf', async () => {
    findMany.mockResolvedValue([]);
    count.mockResolvedValue(0);
    await service.execute({});
    expect(findMany).toHaveBeenCalledWith({}, 0, 10);
  });

  it('filtra por uf', async () => {
    findMany.mockResolvedValue([]);
    count.mockResolvedValue(0);
    await service.execute({ uf: Uf.SP });
    const w = { uf: Uf.SP };
    expect(findMany).toHaveBeenCalledWith(w, 0, 10);
    expect(count).toHaveBeenCalledWith(w);
  });

  it('paginação', async () => {
    const row = buildAerodromeGroupFixture();
    findMany.mockResolvedValue([row]);
    count.mockResolvedValue(3);
    const out = await service.execute({ page: 2, limit: 10 });
    expect(findMany).toHaveBeenCalledWith({}, 10, 10);
    expect(out.data[0].id).toBe(row.id);
  });
});
