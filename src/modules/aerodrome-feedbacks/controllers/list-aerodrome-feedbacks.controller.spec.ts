import { AerodromeFeedbacksPaginatedResponseDTO } from '../dtos/aerodrome-feedbacks-paginated-response.dto';
import type { ListAerodromeFeedbacksService } from '../services/list-aerodrome-feedbacks.service';

import { ListAerodromeFeedbacksController } from './list-aerodrome-feedbacks.controller';

describe('ListAerodromeFeedbacksController', () => {
  let controller: ListAerodromeFeedbacksController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new ListAerodromeFeedbacksController({
      execute,
    } as unknown as ListAerodromeFeedbacksService);
  });

  it('delega query', async () => {
    const q = { limit: 5 };
    const p = new AerodromeFeedbacksPaginatedResponseDTO([], 1, 5, 0);
    execute.mockResolvedValue(p);
    await expect(controller.handle(q)).resolves.toBe(p);
    expect(execute).toHaveBeenCalledWith(q);
  });
});
