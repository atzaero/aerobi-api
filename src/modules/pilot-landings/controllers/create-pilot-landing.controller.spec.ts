import { CreatePilotLandingDTO } from '../dtos/create-pilot-landing.dto';
import { PilotLandingResponseDTO } from '../dtos/pilot-landing-response.dto';
import type { CreatePilotLandingService } from '../services/create-pilot-landing.service';

import { CreatePilotLandingController } from './create-pilot-landing.controller';

describe('CreatePilotLandingController', () => {
  let controller: CreatePilotLandingController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new CreatePilotLandingController({
      execute,
    } as unknown as CreatePilotLandingService);
  });

  it('delega POST ao service.execute com o body', async () => {
    const dto: CreatePilotLandingDTO = {
      registration: 'PT-A',
      localName: 'L',
      localIcao: 'SD',
      checked: false,
      imagesPath: 'x',
      landingAt: new Date(),
    };
    const response = new PilotLandingResponseDTO();
    response.id = 'uuid';
    execute.mockResolvedValue(response);

    await expect(controller.handle(dto)).resolves.toBe(response);
    expect(execute).toHaveBeenCalledTimes(1);
    expect(execute).toHaveBeenCalledWith(dto);
  });
});
