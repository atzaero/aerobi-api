import { LandingRequestParamDTO } from '../dtos/landing-request-param.dto';
import { LandingRequestResponseDTO } from '../dtos/landing-request-response.dto';
import type { FindLandingRequestByIdService } from '../services/find-landing-request-by-id.service';

import { FindLandingRequestByIdController } from './find-landing-request-by-id.controller';

describe('FindLandingRequestByIdController', () => {
  let controller: FindLandingRequestByIdController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new FindLandingRequestByIdController({
      execute,
    } as unknown as FindLandingRequestByIdService);
  });

  it('passa landingRequestId como id', async () => {
    const params: LandingRequestParamDTO = {
      landingRequestId: '33333333-3333-4333-8333-333333333333',
    };
    const row = new LandingRequestResponseDTO();
    execute.mockResolvedValue(row);
    await expect(controller.handle(params)).resolves.toBe(row);
    expect(execute).toHaveBeenCalledWith({ id: params.landingRequestId });
  });
});
