import { ListAerodromeGroupsService } from '../services/list-aerodrome-groups.service';
import { ListAerodromeGroupsController } from './list-aerodrome-groups.controller';

describe('ListAerodromeGroupsController', () => {
  let controller: ListAerodromeGroupsController;
  let service: jest.Mocked<Pick<ListAerodromeGroupsService, 'execute'>>;

  beforeEach(() => {
    service = { execute: jest.fn() };
    controller = new ListAerodromeGroupsController(
      service as unknown as ListAerodromeGroupsService,
    );
  });

  it('is defined', () => {
    expect(controller).toBeDefined();
  });

  // TODO: casos de sucesso e erro
});
