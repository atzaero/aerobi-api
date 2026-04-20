import { OperationalAerodromeRepository } from '../repositories/operational-aerodrome.repository';
import { FindOperationalAerodromeByIdService } from './find-operational-aerodrome-by-id.service';

describe('FindOperationalAerodromeByIdService', () => {
  let service: FindOperationalAerodromeByIdService;

  beforeEach(() => {
    const repo = {} as unknown as OperationalAerodromeRepository;
    service = new FindOperationalAerodromeByIdService(repo);
  });

  it('is defined', () => {
    expect(service).toBeDefined();
  });

  // TODO: casos de sucesso e erro
});
