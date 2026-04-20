import { LandingRequestRepository } from '../repositories/landing-request.repository';
import { ListLandingRequestsService } from './list-landing-requests.service';

describe('ListLandingRequestsService', () => {
  let service: ListLandingRequestsService;

  beforeEach(() => {
    const repo = {} as unknown as LandingRequestRepository;
    service = new ListLandingRequestsService(repo);
  });

  it('is defined', () => {
    expect(service).toBeDefined();
  });

  // TODO: casos de sucesso e erro
});
