import { TechnicalVisitRepository } from '../repositories/technical-visit.repository';
import { CreateTechnicalVisitService } from './create-technical-visit.service';

describe('CreateTechnicalVisitService', () => {
  let service: CreateTechnicalVisitService;

  beforeEach(() => {
    const repo = {} as unknown as TechnicalVisitRepository;
    service = new CreateTechnicalVisitService(repo);
  });

  it('is defined', () => {
    expect(service).toBeDefined();
  });

  // TODO: casos de sucesso e erro
});
