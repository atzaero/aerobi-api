import { PilotLandingRepository } from '../repositories/pilot-landing.repository';
import { FindPilotLandingByIdService } from './find-pilot-landing-by-id.service';

describe('FindPilotLandingByIdService', () => {
  let service: FindPilotLandingByIdService;

  beforeEach(() => {
    const repo = {} as unknown as PilotLandingRepository;
    service = new FindPilotLandingByIdService(repo);
  });

  it('is defined', () => {
    expect(service).toBeDefined();
  });

  // TODO: casos de sucesso e erro
});
