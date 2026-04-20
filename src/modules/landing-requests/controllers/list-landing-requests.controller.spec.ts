import { ListLandingRequestsService } from '../services/list-landing-requests.service';
import { ListLandingRequestsController } from './list-landing-requests.controller';

describe('ListLandingRequestsController', () => {
  let controller: ListLandingRequestsController;
  let service: jest.Mocked<Pick<ListLandingRequestsService, 'execute'>>;

  beforeEach(() => {
    service = { execute: jest.fn() };
    controller = new ListLandingRequestsController(
      service as unknown as ListLandingRequestsService,
    );
  });

  it('is defined', () => {
    expect(controller).toBeDefined();
  });

  // TODO: casos de sucesso e erro
});
