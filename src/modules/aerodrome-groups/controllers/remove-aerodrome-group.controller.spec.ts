import { RemoveAerodromeGroupService } from '../services/remove-aerodrome-group.service';
import { RemoveAerodromeGroupController } from './remove-aerodrome-group.controller';

describe('RemoveAerodromeGroupController', () => {
  let controller: RemoveAerodromeGroupController;
  let service: jest.Mocked<Pick<RemoveAerodromeGroupService, 'execute'>>;

  beforeEach(() => {
    service = { execute: jest.fn() };
    controller = new RemoveAerodromeGroupController(
      service as unknown as RemoveAerodromeGroupService,
    );
  });

  it('is defined', () => {
    expect(controller).toBeDefined();
  });

  // TODO: casos de sucesso e erro
});
