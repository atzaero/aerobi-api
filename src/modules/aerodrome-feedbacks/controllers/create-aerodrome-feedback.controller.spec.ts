import { FeedbackRating } from '@/generated/prisma/client';

import { AerodromeFeedbackResponseDTO } from '../dtos/aerodrome-feedback-response.dto';
import { CreateAerodromeFeedbackDTO } from '../dtos/create-aerodrome-feedback.dto';
import type { CreateAerodromeFeedbackService } from '../services/create-aerodrome-feedback.service';

import { CreateAerodromeFeedbackController } from './create-aerodrome-feedback.controller';

describe('CreateAerodromeFeedbackController', () => {
  let controller: CreateAerodromeFeedbackController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new CreateAerodromeFeedbackController({
      execute,
    } as unknown as CreateAerodromeFeedbackService);
  });

  it('delega ao service', async () => {
    const dto: CreateAerodromeFeedbackDTO = {
      aerodromeId: '22222222-2222-4222-8222-222222222222',
      rating: FeedbackRating.POSITIVE,
      sessionHash: 'h',
    };
    const row = new AerodromeFeedbackResponseDTO();
    execute.mockResolvedValue(row);
    await expect(controller.handle(dto)).resolves.toBe(row);
    expect(execute).toHaveBeenCalledWith(dto);
  });
});
