import { AerodromeFeedbackParamDTO } from '../dtos/aerodrome-feedback-param.dto';
import { AerodromeFeedbackResponseDTO } from '../dtos/aerodrome-feedback-response.dto';
import { UpdateAerodromeFeedbackDTO } from '../dtos/update-aerodrome-feedback.dto';
import type { UpdateAerodromeFeedbackService } from '../services/update-aerodrome-feedback.service';

import { UpdateAerodromeFeedbackController } from './update-aerodrome-feedback.controller';

describe('UpdateAerodromeFeedbackController', () => {
  let controller: UpdateAerodromeFeedbackController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new UpdateAerodromeFeedbackController({
      execute,
    } as unknown as UpdateAerodromeFeedbackService);
  });

  it('merge', async () => {
    const params: AerodromeFeedbackParamDTO = {
      aerodromeFeedbackId: '55555555-5555-4555-8555-555555555555',
    };
    const body: UpdateAerodromeFeedbackDTO = { comment: 'c' };
    const row = new AerodromeFeedbackResponseDTO();
    execute.mockResolvedValue(row);
    await expect(controller.handle(params, body)).resolves.toBe(row);
    expect(execute).toHaveBeenCalledWith({
      id: params.aerodromeFeedbackId,
      ...body,
    });
  });
});
