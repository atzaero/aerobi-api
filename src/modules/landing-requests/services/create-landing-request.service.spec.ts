import { LandingRequestRepository } from '../repositories/landing-request.repository';
import { CreateLandingRequestService } from './create-landing-request.service';

describe('CreateLandingRequestService', () => {
  let service: CreateLandingRequestService;

  beforeEach(() => {
    const repo = {} as unknown as LandingRequestRepository;
    service = new CreateLandingRequestService(repo);
  });

  it('is defined', () => {
    expect(service).toBeDefined();
  });

  // TODO: casos de sucesso e erro
});
