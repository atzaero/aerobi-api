import { AerodromeGroupRepository } from '../repositories/aerodrome-group.repository';
import { RemoveAerodromeGroupService } from './remove-aerodrome-group.service';

describe('RemoveAerodromeGroupService', () => {
  let service: RemoveAerodromeGroupService;

  beforeEach(() => {
    const repo = {} as unknown as AerodromeGroupRepository;
    service = new RemoveAerodromeGroupService(repo);
  });

  it('is defined', () => {
    expect(service).toBeDefined();
  });

  // TODO: casos de sucesso e erro
});
