import { CreateAerodromeGroupService } from '../services/create-aerodrome-group.service';
import { CreateAerodromeGroupController } from './create-aerodrome-group.controller';

describe('CreateAerodromeGroupController', () => {
  let controller: CreateAerodromeGroupController;
  let service: jest.Mocked<Pick<CreateAerodromeGroupService, 'execute'>>;

  beforeEach(() => {
    service = { execute: jest.fn() };
    controller = new CreateAerodromeGroupController(
      service as unknown as CreateAerodromeGroupService,
    );
  });

  it('is defined', () => {
    expect(controller).toBeDefined();
  });

  // TODO: casos de sucesso e erro
});
