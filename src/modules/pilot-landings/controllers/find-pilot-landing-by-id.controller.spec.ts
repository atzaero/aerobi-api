import { PilotLandingResponseDTO } from '../dtos/pilot-landing-response.dto';
import { PilotLandingParamDTO } from '../dtos/pilot-landing-param.dto';
import type { FindPilotLandingByIdService } from '../services/find-pilot-landing-by-id.service';

import { FindPilotLandingByIdController } from './find-pilot-landing-by-id.controller';

describe('FindPilotLandingByIdController', () => {
  let controller: FindPilotLandingByIdController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new FindPilotLandingByIdController({
      execute,
    } as unknown as FindPilotLandingByIdService);
  });

  it('mapeia param pilotLandingId para execute id', async () => {
    const params: PilotLandingParamDTO = {
      pilotLandingId: '33333333-3333-4333-8333-333333333333',
    };
    const row = new PilotLandingResponseDTO();
    row.id = params.pilotLandingId;
    execute.mockResolvedValue(row);

    await expect(controller.handle(params)).resolves.toBe(row);
    expect(execute).toHaveBeenCalledWith({ id: params.pilotLandingId });
  });
});
