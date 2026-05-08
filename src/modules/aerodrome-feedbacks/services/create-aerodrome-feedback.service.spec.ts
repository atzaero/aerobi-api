import { FeedbackRating } from '@/generated/prisma/client';

import type { CreateAerodromeFeedbackDTO } from '../dtos/create-aerodrome-feedback.dto';
import { buildAerodromeFeedbackCreateInput } from '../mappers/aerodrome-feedback.prisma.mapper';
import type { AerodromeFeedbackRepository } from '../repositories/aerodrome-feedback.repository';
import { buildAerodromeFeedbackFixture } from '../testing/aerodrome-feedback.entity.fixture';

import { CreateAerodromeFeedbackService } from './create-aerodrome-feedback.service';

describe('CreateAerodromeFeedbackService', () => {
  let service: CreateAerodromeFeedbackService;
  let create: jest.Mock;

  beforeEach(() => {
    create = jest.fn();
    const repo = { create } as unknown as AerodromeFeedbackRepository;
    service = new CreateAerodromeFeedbackService(repo);
  });

  it('create input alinhado ao mapper', async () => {
    const dto: CreateAerodromeFeedbackDTO = {
      operationalAerodromeId: '22222222-2222-4222-8222-222222222222',
      rating: FeedbackRating.NEGATIVE,
      sessionHash: 's',
      feedbackDate: new Date('2024-04-01T00:00:00.000Z'),
      comment: 'ok',
    };
    const saved = buildAerodromeFeedbackFixture({
      rating: FeedbackRating.NEGATIVE,
      comment: 'ok',
    });
    create.mockResolvedValue(saved);

    const out = await service.execute(dto);

    expect(create).toHaveBeenCalledWith(buildAerodromeFeedbackCreateInput(dto));
    expect(out.rating).toBe(FeedbackRating.NEGATIVE);
  });
});
