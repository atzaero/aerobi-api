import { OperationalAerodromeRepository } from '../repositories/operational-aerodrome.repository';
import { ListOperationalAerodromesService } from './list-operational-aerodromes.service';

describe('ListOperationalAerodromesService', () => {
  let service: ListOperationalAerodromesService;

  beforeEach(() => {
    const repo = {} as unknown as OperationalAerodromeRepository;
    service = new ListOperationalAerodromesService(repo);
  });

  it('is defined', () => {
    expect(service).toBeDefined();
  });

  // TODO: casos de sucesso e erro
});
