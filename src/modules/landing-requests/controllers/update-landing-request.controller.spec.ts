import { LandingRequestStatus } from '@/generated/prisma/client';

import { LandingRequestParamDTO } from '../dtos/landing-request-param.dto';
import { LandingRequestResponseDTO } from '../dtos/landing-request-response.dto';
import { UpdateLandingRequestDTO } from '../dtos/update-landing-request.dto';
import type { UpdateLandingRequestService } from '../services/update-landing-request.service';

import { UpdateLandingRequestController } from './update-landing-request.controller';

describe('UpdateLandingRequestController', () => {
  let controller: UpdateLandingRequestController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new UpdateLandingRequestController({
      execute,
    } as unknown as UpdateLandingRequestService);
  });

  it('merge params e body', async () => {
    const params: LandingRequestParamDTO = {
      landingRequestId: '33333333-3333-4333-8333-333333333333',
    };
    const body: UpdateLandingRequestDTO = {
      status: LandingRequestStatus.REJECTED,
    };
    const row = new LandingRequestResponseDTO();
    execute.mockResolvedValue(row);
    await expect(controller.handle(params, body)).resolves.toBe(row);
    expect(execute).toHaveBeenCalledWith({
      id: params.landingRequestId,
      ...body,
    });
  });
});
