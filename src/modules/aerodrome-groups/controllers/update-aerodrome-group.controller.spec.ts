import { UpdateAerodromeGroupService } from '../services/update-aerodrome-group.service';
import { UpdateAerodromeGroupController } from './update-aerodrome-group.controller';

describe('UpdateAerodromeGroupController', () => {
  let controller: UpdateAerodromeGroupController;
  let service: jest.Mocked<Pick<UpdateAerodromeGroupService, 'execute'>>;

  beforeEach(() => {
    service = { execute: jest.fn() };
    controller = new UpdateAerodromeGroupController(
      service as unknown as UpdateAerodromeGroupService,
    );
  });

  it('is defined', () => {
    expect(controller).toBeDefined();
  });

  // TODO: casos de sucesso e erro
});
