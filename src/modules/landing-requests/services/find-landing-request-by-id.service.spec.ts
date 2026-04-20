import { LandingRequestRepository } from '../repositories/landing-request.repository';
import { FindLandingRequestByIdService } from './find-landing-request-by-id.service';

describe('FindLandingRequestByIdService', () => {
  let service: FindLandingRequestByIdService;

  beforeEach(() => {
    const repo = {} as unknown as LandingRequestRepository;
    service = new FindLandingRequestByIdService(repo);
  });

  it('is defined', () => {
    expect(service).toBeDefined();
  });

  // TODO: casos de sucesso e erro
});
