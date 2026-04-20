import { FindLandingRequestByIdService } from '../services/find-landing-request-by-id.service';
import { FindLandingRequestByIdController } from './find-landing-request-by-id.controller';

describe('FindLandingRequestByIdController', () => {
  let controller: FindLandingRequestByIdController;
  let service: jest.Mocked<Pick<FindLandingRequestByIdService, 'execute'>>;

  beforeEach(() => {
    service = { execute: jest.fn() };
    controller = new FindLandingRequestByIdController(
      service as unknown as FindLandingRequestByIdService,
    );
  });

  it('is defined', () => {
    expect(controller).toBeDefined();
  });

  // TODO: casos de sucesso e erro
});
