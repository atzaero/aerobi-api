import { FeedbackRating } from '@/generated/prisma/client';

import { FeedbackResponseDTO } from '../dtos/feedback-response.dto';
import { CreateFeedbackDTO } from '../dtos/create-feedback.dto';
import type { CreateFeedbackService } from '../services/create-feedback.service';

import { CreateFeedbackController } from './create-feedback.controller';

describe('CreateFeedbackController', () => {
  let controller: CreateFeedbackController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new CreateFeedbackController({
      execute,
    } as unknown as CreateFeedbackService);
  });

  it('delega ao service', async () => {
    const dto: CreateFeedbackDTO = {
      aerodromeId: '22222222-2222-4222-8222-222222222222',
      rating: FeedbackRating.POSITIVE,
      sessionHash: 'h',
    };
    const row = new FeedbackResponseDTO();
    execute.mockResolvedValue(row);
    await expect(controller.handle(dto)).resolves.toBe(row);
    expect(execute).toHaveBeenCalledWith(dto);
  });
});
