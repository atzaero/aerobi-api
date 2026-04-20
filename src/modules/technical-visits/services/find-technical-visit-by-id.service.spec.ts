import { TechnicalVisitRepository } from '../repositories/technical-visit.repository';
import { FindTechnicalVisitByIdService } from './find-technical-visit-by-id.service';

describe('FindTechnicalVisitByIdService', () => {
  let service: FindTechnicalVisitByIdService;

  beforeEach(() => {
    const repo = {} as unknown as TechnicalVisitRepository;
    service = new FindTechnicalVisitByIdService(repo);
  });

  it('is defined', () => {
    expect(service).toBeDefined();
  });

  // TODO: casos de sucesso e erro
});
