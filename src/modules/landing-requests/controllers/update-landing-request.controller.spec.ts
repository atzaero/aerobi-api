import { UpdateLandingRequestService } from '../services/update-landing-request.service';
import { UpdateLandingRequestController } from './update-landing-request.controller';

describe('UpdateLandingRequestController', () => {
  let controller: UpdateLandingRequestController;
  let service: jest.Mocked<Pick<UpdateLandingRequestService, 'execute'>>;

  beforeEach(() => {
    service = { execute: jest.fn() };
    controller = new UpdateLandingRequestController(
      service as unknown as UpdateLandingRequestService,
    );
  });

  it('is defined', () => {
    expect(controller).toBeDefined();
  });

  // TODO: casos de sucesso e erro
});
