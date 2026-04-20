import { AerodromeGroupRepository } from '../repositories/aerodrome-group.repository';
import { CreateAerodromeGroupService } from './create-aerodrome-group.service';

describe('CreateAerodromeGroupService', () => {
  let service: CreateAerodromeGroupService;

  beforeEach(() => {
    const repo = {} as unknown as AerodromeGroupRepository;
    service = new CreateAerodromeGroupService(repo);
  });

  it('is defined', () => {
    expect(service).toBeDefined();
  });

  // TODO: casos de sucesso e erro
});
