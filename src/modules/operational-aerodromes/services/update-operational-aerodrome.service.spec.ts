import { OperationalAerodromeRepository } from '../repositories/operational-aerodrome.repository';
import { UpdateOperationalAerodromeService } from './update-operational-aerodrome.service';

describe('UpdateOperationalAerodromeService', () => {
  let service: UpdateOperationalAerodromeService;

  beforeEach(() => {
    const repo = {} as unknown as OperationalAerodromeRepository;
    service = new UpdateOperationalAerodromeService(repo);
  });

  it('is defined', () => {
    expect(service).toBeDefined();
  });

  // TODO: casos de sucesso e erro
});
