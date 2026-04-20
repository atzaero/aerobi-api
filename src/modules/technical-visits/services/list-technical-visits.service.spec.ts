import { TechnicalVisitRepository } from '../repositories/technical-visit.repository';
import { ListTechnicalVisitsService } from './list-technical-visits.service';

describe('ListTechnicalVisitsService', () => {
  let service: ListTechnicalVisitsService;

  beforeEach(() => {
    const repo = {} as unknown as TechnicalVisitRepository;
    service = new ListTechnicalVisitsService(repo);
  });

  it('is defined', () => {
    expect(service).toBeDefined();
  });

  // TODO: casos de sucesso e erro
});
