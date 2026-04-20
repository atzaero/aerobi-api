import { UpdatePilotLandingService } from '../services/update-pilot-landing.service';
import { UpdatePilotLandingController } from './update-pilot-landing.controller';

describe('UpdatePilotLandingController', () => {
  let controller: UpdatePilotLandingController;
  let service: jest.Mocked<Pick<UpdatePilotLandingService, 'execute'>>;

  beforeEach(() => {
    service = { execute: jest.fn() };
    controller = new UpdatePilotLandingController(
      service as unknown as UpdatePilotLandingService,
    );
  });

  it('is defined', () => {
    expect(controller).toBeDefined();
  });

  // TODO: casos de sucesso e erro
});
