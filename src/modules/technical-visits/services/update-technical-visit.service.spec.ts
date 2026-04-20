import { TechnicalVisitRepository } from '../repositories/technical-visit.repository';
import { UpdateTechnicalVisitService } from './update-technical-visit.service';

describe('UpdateTechnicalVisitService', () => {
  let service: UpdateTechnicalVisitService;

  beforeEach(() => {
    const repo = {} as unknown as TechnicalVisitRepository;
    service = new UpdateTechnicalVisitService(repo);
  });

  it('is defined', () => {
    expect(service).toBeDefined();
  });

  // TODO: casos de sucesso e erro
});
