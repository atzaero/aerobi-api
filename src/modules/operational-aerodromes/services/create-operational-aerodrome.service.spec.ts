import { OperationalAerodromeRepository } from '../repositories/operational-aerodrome.repository';
import { CreateOperationalAerodromeService } from './create-operational-aerodrome.service';

describe('CreateOperationalAerodromeService', () => {
  let service: CreateOperationalAerodromeService;

  beforeEach(() => {
    const repo = {} as unknown as OperationalAerodromeRepository;
    service = new CreateOperationalAerodromeService(repo);
  });

  it('is defined', () => {
    expect(service).toBeDefined();
  });

  // TODO: casos de sucesso e erro
});
