import { LandingRequestRepository } from '../repositories/landing-request.repository';
import { RemoveLandingRequestService } from './remove-landing-request.service';

describe('RemoveLandingRequestService', () => {
  let service: RemoveLandingRequestService;

  beforeEach(() => {
    const repo = {} as unknown as LandingRequestRepository;
    service = new RemoveLandingRequestService(repo);
  });

  it('is defined', () => {
    expect(service).toBeDefined();
  });

  // TODO: casos de sucesso e erro
});
