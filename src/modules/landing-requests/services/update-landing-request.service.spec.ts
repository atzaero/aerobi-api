import { LandingRequestRepository } from '../repositories/landing-request.repository';
import { UpdateLandingRequestService } from './update-landing-request.service';

describe('UpdateLandingRequestService', () => {
  let service: UpdateLandingRequestService;

  beforeEach(() => {
    const repo = {} as unknown as LandingRequestRepository;
    service = new UpdateLandingRequestService(repo);
  });

  it('is defined', () => {
    expect(service).toBeDefined();
  });

  // TODO: casos de sucesso e erro
});
