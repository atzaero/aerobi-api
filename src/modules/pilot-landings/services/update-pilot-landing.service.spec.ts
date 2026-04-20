import { PilotLandingRepository } from '../repositories/pilot-landing.repository';
import { UpdatePilotLandingService } from './update-pilot-landing.service';

describe('UpdatePilotLandingService', () => {
  let service: UpdatePilotLandingService;

  beforeEach(() => {
    const repo = {} as unknown as PilotLandingRepository;
    service = new UpdatePilotLandingService(repo);
  });

  it('is defined', () => {
    expect(service).toBeDefined();
  });

  // TODO: casos de sucesso e erro
});
