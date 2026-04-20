import { CreatePilotLandingService } from '../services/create-pilot-landing.service';
import { CreatePilotLandingController } from './create-pilot-landing.controller';

describe('CreatePilotLandingController', () => {
  let controller: CreatePilotLandingController;
  let service: jest.Mocked<Pick<CreatePilotLandingService, 'execute'>>;

  beforeEach(() => {
    service = { execute: jest.fn() };
    controller = new CreatePilotLandingController(
      service as unknown as CreatePilotLandingService,
    );
  });

  it('is defined', () => {
    expect(controller).toBeDefined();
  });

  // TODO: casos de sucesso e erro
});
