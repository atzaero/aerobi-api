import { AerodromeGroupRepository } from '../repositories/aerodrome-group.repository';
import { FindAerodromeGroupByIdService } from './find-aerodrome-group-by-id.service';

describe('FindAerodromeGroupByIdService', () => {
  let service: FindAerodromeGroupByIdService;

  beforeEach(() => {
    const repo = {} as unknown as AerodromeGroupRepository;
    service = new FindAerodromeGroupByIdService(repo);
  });

  it('is defined', () => {
    expect(service).toBeDefined();
  });

  // TODO: casos de sucesso e erro
});
