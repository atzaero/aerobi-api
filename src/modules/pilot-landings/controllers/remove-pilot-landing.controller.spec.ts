import { RemovePilotLandingService } from '../services/remove-pilot-landing.service';
import { RemovePilotLandingController } from './remove-pilot-landing.controller';

describe('RemovePilotLandingController', () => {
  let controller: RemovePilotLandingController;
  let service: jest.Mocked<Pick<RemovePilotLandingService, 'execute'>>;

  beforeEach(() => {
    service = { execute: jest.fn() };
    controller = new RemovePilotLandingController(
      service as unknown as RemovePilotLandingService,
    );
  });

  it('is defined', () => {
    expect(controller).toBeDefined();
  });

  // TODO: casos de sucesso e erro
});
