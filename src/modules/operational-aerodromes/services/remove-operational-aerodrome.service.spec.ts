import { OperationalAerodromeRepository } from '../repositories/operational-aerodrome.repository';
import { RemoveOperationalAerodromeService } from './remove-operational-aerodrome.service';

describe('RemoveOperationalAerodromeService', () => {
  let service: RemoveOperationalAerodromeService;

  beforeEach(() => {
    const repo = {} as unknown as OperationalAerodromeRepository;
    service = new RemoveOperationalAerodromeService(repo);
  });

  it('is defined', () => {
    expect(service).toBeDefined();
  });

  // TODO: casos de sucesso e erro
});
