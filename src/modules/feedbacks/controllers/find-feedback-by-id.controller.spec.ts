import { FeedbackParamDTO } from '../dtos/feedback-param.dto';
import { FeedbackResponseDTO } from '../dtos/feedback-response.dto';
import type { FindFeedbackByIdService } from '../services/find-feedback-by-id.service';

import { FindFeedbackByIdController } from './find-feedback-by-id.controller';

describe('FindFeedbackByIdController', () => {
  let controller: FindFeedbackByIdController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new FindFeedbackByIdController({
      execute,
    } as unknown as FindFeedbackByIdService);
  });

  it('usa o id do param', async () => {
    const params: FeedbackParamDTO = {
      id: '55555555-5555-4555-8555-555555555555',
    };
    const row = new FeedbackResponseDTO();
    execute.mockResolvedValue(row);
    await expect(controller.handle(params)).resolves.toBe(row);
    expect(execute).toHaveBeenCalledWith({ id: params.id });
  });
});
