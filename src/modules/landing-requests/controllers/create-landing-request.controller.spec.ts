import { CreateLandingRequestService } from '../services/create-landing-request.service';
import { CreateLandingRequestController } from './create-landing-request.controller';

describe('CreateLandingRequestController', () => {
  let controller: CreateLandingRequestController;
  let service: jest.Mocked<Pick<CreateLandingRequestService, 'execute'>>;

  beforeEach(() => {
    service = { execute: jest.fn() };
    controller = new CreateLandingRequestController(
      service as unknown as CreateLandingRequestService,
    );
  });

  it('is defined', () => {
    expect(controller).toBeDefined();
  });

  // TODO: casos de sucesso e erro
});
