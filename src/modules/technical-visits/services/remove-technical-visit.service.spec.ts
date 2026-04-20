import { TechnicalVisitRepository } from '../repositories/technical-visit.repository';
import { RemoveTechnicalVisitService } from './remove-technical-visit.service';

describe('RemoveTechnicalVisitService', () => {
  let service: RemoveTechnicalVisitService;

  beforeEach(() => {
    const repo = {} as unknown as TechnicalVisitRepository;
    service = new RemoveTechnicalVisitService(repo);
  });

  it('is defined', () => {
    expect(service).toBeDefined();
  });

  // TODO: casos de sucesso e erro
});
