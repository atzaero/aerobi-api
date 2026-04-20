import { AerodromeGroupRepository } from '../repositories/aerodrome-group.repository';
import { UpdateAerodromeGroupService } from './update-aerodrome-group.service';

describe('UpdateAerodromeGroupService', () => {
  let service: UpdateAerodromeGroupService;

  beforeEach(() => {
    const repo = {} as unknown as AerodromeGroupRepository;
    service = new UpdateAerodromeGroupService(repo);
  });

  it('is defined', () => {
    expect(service).toBeDefined();
  });

  // TODO: casos de sucesso e erro
});
