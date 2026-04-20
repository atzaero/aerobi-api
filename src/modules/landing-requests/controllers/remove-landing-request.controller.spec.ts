import { RemoveLandingRequestService } from '../services/remove-landing-request.service';
import { RemoveLandingRequestController } from './remove-landing-request.controller';

describe('RemoveLandingRequestController', () => {
  let controller: RemoveLandingRequestController;
  let service: jest.Mocked<Pick<RemoveLandingRequestService, 'execute'>>;

  beforeEach(() => {
    service = { execute: jest.fn() };
    controller = new RemoveLandingRequestController(
      service as unknown as RemoveLandingRequestService,
    );
  });

  it('is defined', () => {
    expect(controller).toBeDefined();
  });

  // TODO: casos de sucesso e erro
});
