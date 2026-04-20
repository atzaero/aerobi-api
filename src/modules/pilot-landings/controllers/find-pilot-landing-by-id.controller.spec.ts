import { FindPilotLandingByIdService } from '../services/find-pilot-landing-by-id.service';
import { FindPilotLandingByIdController } from './find-pilot-landing-by-id.controller';

describe('FindPilotLandingByIdController', () => {
  let controller: FindPilotLandingByIdController;
  let service: jest.Mocked<Pick<FindPilotLandingByIdService, 'execute'>>;

  beforeEach(() => {
    service = { execute: jest.fn() };
    controller = new FindPilotLandingByIdController(
      service as unknown as FindPilotLandingByIdService,
    );
  });

  it('is defined', () => {
    expect(controller).toBeDefined();
  });

  // TODO: casos de sucesso e erro
});
