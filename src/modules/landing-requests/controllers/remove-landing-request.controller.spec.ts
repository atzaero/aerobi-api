import { LandingRequestParamDTO } from '../dtos/landing-request-param.dto';
import { LandingRequestResponseDTO } from '../dtos/landing-request-response.dto';
import type { RemoveLandingRequestService } from '../services/remove-landing-request.service';

import { RemoveLandingRequestController } from './remove-landing-request.controller';

describe('RemoveLandingRequestController', () => {
  let controller: RemoveLandingRequestController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new RemoveLandingRequestController({
      execute,
    } as unknown as RemoveLandingRequestService);
  });

  it('deletedBy system até existir auth', async () => {
    const params: LandingRequestParamDTO = {
      landingRequestId: '33333333-3333-4333-8333-333333333333',
    };
    const row = new LandingRequestResponseDTO();
    execute.mockResolvedValue(row);
    await expect(controller.handle(params)).resolves.toBe(row);
    expect(execute).toHaveBeenCalledWith({
      id: params.landingRequestId,
      deletedBy: 'system',
    });
  });
});
