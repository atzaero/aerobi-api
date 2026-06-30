import { LandingRequestStatus } from '@/generated/prisma/client';

import type { LandingRequestRepository } from '../repositories/landing-request.repository';
import { buildLandingRequestFixture } from '../testing/landing-request.entity.fixture';

import { ListLandingRequestsService } from './list-landing-requests.service';

describe('ListLandingRequestsService', () => {
  let service: ListLandingRequestsService;
  let findMany: jest.Mock;
  let count: jest.Mock;

  beforeEach(() => {
    findMany = jest.fn();
    count = jest.fn();
    const repo = { findMany, count } as unknown as LandingRequestRepository;
    service = new ListLandingRequestsService(repo);
  });

  it('where vazio por defeito', async () => {
    findMany.mockResolvedValue([]);
    count.mockResolvedValue(0);
    await service.execute({});
    expect(findMany).toHaveBeenCalledWith({}, 0, 10);
    expect(count).toHaveBeenCalledWith({});
  });

  it('filtra aerodromeId e status', async () => {
    const aid = '22222222-2222-4222-8222-222222222222';
    findMany.mockResolvedValue([]);
    count.mockResolvedValue(0);

    await service.execute({
      aerodromeId: aid,
      status: LandingRequestStatus.APPROVED,
    });

    const w = {
      aerodromeId: aid,
      status: LandingRequestStatus.APPROVED,
    };
    expect(findMany).toHaveBeenCalledWith(w, 0, 10);
    expect(count).toHaveBeenCalledWith(w);
  });

  it('paginação página 2', async () => {
    const row = buildLandingRequestFixture();
    findMany.mockResolvedValue([row]);
    count.mockResolvedValue(5);

    const out = await service.execute({ page: 2, limit: 10 });

    expect(findMany).toHaveBeenCalledWith({}, 10, 10);
    expect(out.meta.currentPage).toBe(2);
    expect(out.data[0].id).toBe(row.id);
  });
});
