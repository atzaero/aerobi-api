import { PilotLandingRepository } from '../repositories/pilot-landing.repository';
import { ListPilotLandingsService } from './list-pilot-landings.service';

describe('ListPilotLandingsService', () => {
  let service: ListPilotLandingsService;

  beforeEach(() => {
    const repo = {} as unknown as PilotLandingRepository;
    service = new ListPilotLandingsService(repo);
  });

  it('is defined', () => {
    expect(service).toBeDefined();
  });

  // TODO: casos de sucesso e erro
});
