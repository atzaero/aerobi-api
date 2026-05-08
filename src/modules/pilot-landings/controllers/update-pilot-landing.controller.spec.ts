import { PilotLandingResponseDTO } from '../dtos/pilot-landing-response.dto';
import { PilotLandingParamDTO } from '../dtos/pilot-landing-param.dto';
import { UpdatePilotLandingDTO } from '../dtos/update-pilot-landing.dto';
import type { UpdatePilotLandingService } from '../services/update-pilot-landing.service';

import { UpdatePilotLandingController } from './update-pilot-landing.controller';

describe('UpdatePilotLandingController', () => {
  let controller: UpdatePilotLandingController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new UpdatePilotLandingController({
      execute,
    } as unknown as UpdatePilotLandingService);
  });

  it('fundir param id com body para execute', async () => {
    const params: PilotLandingParamDTO = {
      pilotLandingId: '33333333-3333-4333-8333-333333333333',
    };
    const body: UpdatePilotLandingDTO = { checked: false };
    const row = new PilotLandingResponseDTO();
    execute.mockResolvedValue(row);

    await expect(controller.handle(params, body)).resolves.toBe(row);
    expect(execute).toHaveBeenCalledWith({
      id: params.pilotLandingId,
      ...body,
    });
  });
});
