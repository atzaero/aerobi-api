import { AerodromeFeedbackParamDTO } from '../dtos/aerodrome-feedback-param.dto';
import { AerodromeFeedbackResponseDTO } from '../dtos/aerodrome-feedback-response.dto';
import type { FindAerodromeFeedbackByIdService } from '../services/find-aerodrome-feedback-by-id.service';

import { FindAerodromeFeedbackByIdController } from './find-aerodrome-feedback-by-id.controller';

describe('FindAerodromeFeedbackByIdController', () => {
  let controller: FindAerodromeFeedbackByIdController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new FindAerodromeFeedbackByIdController({
      execute,
    } as unknown as FindAerodromeFeedbackByIdService);
  });

  it('usa o id do param', async () => {
    const params: AerodromeFeedbackParamDTO = {
      id: '55555555-5555-4555-8555-555555555555',
    };
    const row = new AerodromeFeedbackResponseDTO();
    execute.mockResolvedValue(row);
    await expect(controller.handle(params)).resolves.toBe(row);
    expect(execute).toHaveBeenCalledWith({ id: params.id });
  });
});
