import { PilotLandingRepository } from '../repositories/pilot-landing.repository';
import { RemovePilotLandingService } from './remove-pilot-landing.service';

describe('RemovePilotLandingService', () => {
  let service: RemovePilotLandingService;

  beforeEach(() => {
    const repo = {} as unknown as PilotLandingRepository;
    service = new RemovePilotLandingService(repo);
  });

  it('is defined', () => {
    expect(service).toBeDefined();
  });

  // TODO: casos de sucesso e erro
});
