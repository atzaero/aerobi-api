import { FeedbackSummaryResponseDTO } from '../dtos/feedback-summary-response.dto';
import type { SummaryFeedbacksService } from '../services/summary-feedbacks.service';

import { SummaryFeedbacksController } from './summary-feedbacks.controller';

describe('SummaryFeedbacksController', () => {
  let controller: SummaryFeedbacksController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new SummaryFeedbacksController({
      execute,
    } as unknown as SummaryFeedbacksService);
  });

  it('delega a query', async () => {
    const query = { aerodromeId: '22222222-2222-4222-8222-222222222222' };
    const out = new FeedbackSummaryResponseDTO();
    execute.mockResolvedValue(out);
    await expect(controller.handle(query)).resolves.toBe(out);
    expect(execute).toHaveBeenCalledWith(query);
  });
});
