import { FeedbackRating } from '@/generated/prisma/client';

import type { AerodromeFeedbackRepository } from '../repositories/aerodrome-feedback.repository';

import { SummaryAerodromeFeedbacksService } from './summary-aerodrome-feedbacks.service';

describe('SummaryAerodromeFeedbacksService', () => {
  let service: SummaryAerodromeFeedbacksService;
  let summaryByAerodrome: jest.Mock;

  const aerodromeId = '22222222-2222-4222-8222-222222222222';

  beforeEach(() => {
    summaryByAerodrome = jest.fn();
    const repo = {
      summaryByAerodrome,
    } as unknown as AerodromeFeedbackRepository;
    service = new SummaryAerodromeFeedbacksService(repo);
  });

  it('projeta positive/negative/total', async () => {
    summaryByAerodrome.mockResolvedValue([
      { rating: FeedbackRating.POSITIVE, count: 3 },
      { rating: FeedbackRating.NEGATIVE, count: 2 },
    ]);
    const out = await service.execute({ aerodromeId });
    expect(out).toEqual({ aerodromeId, positive: 3, negative: 2, total: 5 });
  });

  it('rating ausente conta 0', async () => {
    summaryByAerodrome.mockResolvedValue([
      { rating: FeedbackRating.POSITIVE, count: 4 },
    ]);
    const out = await service.execute({ aerodromeId });
    expect(out).toEqual({ aerodromeId, positive: 4, negative: 0, total: 4 });
  });

  it('sem feedbacks devolve zeros', async () => {
    summaryByAerodrome.mockResolvedValue([]);
    const out = await service.execute({ aerodromeId });
    expect(out).toEqual({ aerodromeId, positive: 0, negative: 0, total: 0 });
  });
});
