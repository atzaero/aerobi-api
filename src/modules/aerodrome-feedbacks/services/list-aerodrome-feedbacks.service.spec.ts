import { FeedbackRating } from '@/generated/prisma/client';

import type { AerodromeFeedbackRepository } from '../repositories/aerodrome-feedback.repository';
import { buildAerodromeFeedbackFixture } from '../testing/aerodrome-feedback.entity.fixture';

import { ListAerodromeFeedbacksService } from './list-aerodrome-feedbacks.service';

describe('ListAerodromeFeedbacksService', () => {
  let service: ListAerodromeFeedbacksService;
  let findMany: jest.Mock;
  let count: jest.Mock;

  beforeEach(() => {
    findMany = jest.fn();
    count = jest.fn();
    const repo = { findMany, count } as unknown as AerodromeFeedbackRepository;
    service = new ListAerodromeFeedbacksService(repo);
  });

  it('where vazio', async () => {
    findMany.mockResolvedValue([]);
    count.mockResolvedValue(0);
    await service.execute({});
    expect(findMany).toHaveBeenCalledWith({}, 0, 10);
  });

  it('filtra rating e aeródromo', async () => {
    const aid = '22222222-2222-4222-8222-222222222222';
    findMany.mockResolvedValue([]);
    count.mockResolvedValue(0);
    await service.execute({
      operationalAerodromeId: aid,
      rating: FeedbackRating.POSITIVE,
    });
    const w = {
      operationalAerodromeId: aid,
      rating: FeedbackRating.POSITIVE,
    };
    expect(findMany).toHaveBeenCalledWith(w, 0, 10);
    expect(count).toHaveBeenCalledWith(w);
  });

  it('paginação', async () => {
    const row = buildAerodromeFeedbackFixture();
    findMany.mockResolvedValue([row]);
    count.mockResolvedValue(2);
    const out = await service.execute({ page: 2, limit: 10 });
    expect(findMany).toHaveBeenCalledWith({}, 10, 10);
    expect(out.data[0].id).toBe(row.id);
  });
});
