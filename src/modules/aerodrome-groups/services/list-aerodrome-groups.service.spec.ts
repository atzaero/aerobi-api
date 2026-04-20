import { AerodromeGroupRepository } from '../repositories/aerodrome-group.repository';
import { ListAerodromeGroupsService } from './list-aerodrome-groups.service';

describe('ListAerodromeGroupsService', () => {
  let service: ListAerodromeGroupsService;

  beforeEach(() => {
    const repo = {} as unknown as AerodromeGroupRepository;
    service = new ListAerodromeGroupsService(repo);
  });

  it('is defined', () => {
    expect(service).toBeDefined();
  });

  // TODO: casos de sucesso e erro
});
