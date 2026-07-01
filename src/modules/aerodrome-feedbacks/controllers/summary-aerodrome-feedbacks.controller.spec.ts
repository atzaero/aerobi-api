import { AerodromeFeedbackSummaryResponseDTO } from '../dtos/aerodrome-feedback-summary-response.dto';
import type { SummaryAerodromeFeedbacksService } from '../services/summary-aerodrome-feedbacks.service';

import { SummaryAerodromeFeedbacksController } from './summary-aerodrome-feedbacks.controller';

describe('SummaryAerodromeFeedbacksController', () => {
  let controller: SummaryAerodromeFeedbacksController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new SummaryAerodromeFeedbacksController({
      execute,
    } as unknown as SummaryAerodromeFeedbacksService);
  });

  it('delega a query', async () => {
    const query = { aerodromeId: '22222222-2222-4222-8222-222222222222' };
    const out = new AerodromeFeedbackSummaryResponseDTO();
    execute.mockResolvedValue(out);
    await expect(controller.handle(query)).resolves.toBe(out);
    expect(execute).toHaveBeenCalledWith(query);
  });
});
