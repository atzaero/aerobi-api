import { PilotLandingRepository } from '../repositories/pilot-landing.repository';
import { CreatePilotLandingService } from './create-pilot-landing.service';

describe('CreatePilotLandingService', () => {
  let service: CreatePilotLandingService;

  beforeEach(() => {
    const repo = {} as unknown as PilotLandingRepository;
    service = new CreatePilotLandingService(repo);
  });

  it('is defined', () => {
    expect(service).toBeDefined();
  });

  // TODO: casos de sucesso e erro
});
