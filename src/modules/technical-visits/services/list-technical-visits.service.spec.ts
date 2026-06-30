import type { TechnicalVisitRepository } from '../repositories/technical-visit.repository';
import { buildTechnicalVisitFixture } from '../testing/technical-visit.entity.fixture';

import { ListTechnicalVisitsService } from './list-technical-visits.service';

describe('ListTechnicalVisitsService', () => {
  let service: ListTechnicalVisitsService;
  let findMany: jest.Mock;
  let count: jest.Mock;

  beforeEach(() => {
    findMany = jest.fn();
    count = jest.fn();
    const repo = { findMany, count } as unknown as TechnicalVisitRepository;
    service = new ListTechnicalVisitsService(repo);
  });

  it('where vazio sem filtro de aeródromo', async () => {
    findMany.mockResolvedValue([]);
    count.mockResolvedValue(0);
    await service.execute({});
    expect(findMany).toHaveBeenCalledWith({}, 0, 10);
    expect(count).toHaveBeenCalledWith({});
  });

  it('filtra aerodromeId', async () => {
    const aid = '22222222-2222-4222-8222-222222222222';
    findMany.mockResolvedValue([]);
    count.mockResolvedValue(0);
    await service.execute({ aerodromeId: aid });
    const w = { aerodromeId: aid };
    expect(findMany).toHaveBeenCalledWith(w, 0, 10);
    expect(count).toHaveBeenCalledWith(w);
  });

  it('paginação', async () => {
    const row = buildTechnicalVisitFixture();
    findMany.mockResolvedValue([row]);
    count.mockResolvedValue(11);
    const out = await service.execute({ page: 2, limit: 10 });
    expect(findMany).toHaveBeenCalledWith({}, 10, 10);
    expect(out.data[0].id).toBe(row.id);
  });
});
