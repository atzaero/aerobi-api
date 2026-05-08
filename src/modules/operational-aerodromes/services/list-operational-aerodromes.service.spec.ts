import type { OperationalAerodromeRepository } from '../repositories/operational-aerodrome.repository';
import { buildOperationalAerodromeFixture } from '../testing/operational-aerodrome.entity.fixture';

import { ListOperationalAerodromesService } from './list-operational-aerodromes.service';

describe('ListOperationalAerodromesService', () => {
  let service: ListOperationalAerodromesService;
  let findMany: jest.Mock;
  let count: jest.Mock;

  beforeEach(() => {
    findMany = jest.fn();
    count = jest.fn();
    const repo = {
      findMany,
      count,
    } as unknown as OperationalAerodromeRepository;
    service = new ListOperationalAerodromesService(repo);
  });

  const gid = '44444444-4444-4444-8444-444444444444';

  it('where vazio sem filtros', async () => {
    findMany.mockResolvedValue([]);
    count.mockResolvedValue(0);
    await service.execute({});
    expect(findMany).toHaveBeenCalledWith({}, 0, 10);
  });

  it('filtro groupId', async () => {
    findMany.mockResolvedValue([]);
    count.mockResolvedValue(0);
    await service.execute({ groupId: gid });
    const w = { groupId: gid };
    expect(findMany).toHaveBeenCalledWith(w, 0, 10);
    expect(count).toHaveBeenCalledWith(w);
  });

  it('icao contains insensitive', async () => {
    findMany.mockResolvedValue([]);
    count.mockResolvedValue(0);
    await service.execute({ icao: 'sb' });
    const w = { icao: { contains: 'sb', mode: 'insensitive' } };
    expect(findMany).toHaveBeenCalledWith(w, 0, 10);
  });

  it('isView', async () => {
    findMany.mockResolvedValue([]);
    count.mockResolvedValue(0);
    await service.execute({ isView: true });
    const w = { isView: true };
    expect(findMany).toHaveBeenCalledWith(w, 0, 10);
    expect(count).toHaveBeenCalledWith(w);
  });

  it('paginação', async () => {
    const row = buildOperationalAerodromeFixture();
    findMany.mockResolvedValue([row]);
    count.mockResolvedValue(21);
    const out = await service.execute({ page: 2 });
    expect(findMany).toHaveBeenCalledWith({}, 10, 10);
    expect(out.data[0].id).toBe(row.id);
  });
});
