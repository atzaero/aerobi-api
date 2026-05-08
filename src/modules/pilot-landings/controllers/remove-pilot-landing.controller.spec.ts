import { PilotLandingResponseDTO } from '../dtos/pilot-landing-response.dto';
import { PilotLandingParamDTO } from '../dtos/pilot-landing-param.dto';
import type { RemovePilotLandingService } from '../services/remove-pilot-landing.service';

import { RemovePilotLandingController } from './remove-pilot-landing.controller';

describe('RemovePilotLandingController', () => {
  let controller: RemovePilotLandingController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new RemovePilotLandingController({
      execute,
    } as unknown as RemovePilotLandingService);
  });

  it('usa deletedBy definido pelo controller até existir auth', async () => {
    const params: PilotLandingParamDTO = {
      pilotLandingId: '33333333-3333-4333-8333-333333333333',
    };
    const row = new PilotLandingResponseDTO();
    execute.mockResolvedValue(row);

    await expect(controller.handle(params)).resolves.toBe(row);
    expect(execute).toHaveBeenCalledWith({
      id: params.pilotLandingId,
      deletedBy: 'system',
    });
  });
});
