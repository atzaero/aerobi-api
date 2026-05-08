import { AerodromeFeedbackParamDTO } from '../dtos/aerodrome-feedback-param.dto';
import { AerodromeFeedbackResponseDTO } from '../dtos/aerodrome-feedback-response.dto';
import type { RemoveAerodromeFeedbackService } from '../services/remove-aerodrome-feedback.service';

import { RemoveAerodromeFeedbackController } from './remove-aerodrome-feedback.controller';

describe('RemoveAerodromeFeedbackController', () => {
  let controller: RemoveAerodromeFeedbackController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new RemoveAerodromeFeedbackController({
      execute,
    } as unknown as RemoveAerodromeFeedbackService);
  });

  it('deletedBy system', async () => {
    const params: AerodromeFeedbackParamDTO = {
      aerodromeFeedbackId: '55555555-5555-4555-8555-555555555555',
    };
    const row = new AerodromeFeedbackResponseDTO();
    execute.mockResolvedValue(row);
    await expect(controller.handle(params)).resolves.toBe(row);
    expect(execute).toHaveBeenCalledWith({
      id: params.aerodromeFeedbackId,
      deletedBy: 'system',
    });
  });
});
