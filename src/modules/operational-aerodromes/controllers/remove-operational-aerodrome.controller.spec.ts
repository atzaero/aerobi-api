import { RemoveOperationalAerodromeService } from '../services/remove-operational-aerodrome.service';
import { RemoveOperationalAerodromeController } from './remove-operational-aerodrome.controller';

describe('RemoveOperationalAerodromeController', () => {
  let controller: RemoveOperationalAerodromeController;
  let service: jest.Mocked<Pick<RemoveOperationalAerodromeService, 'execute'>>;

  beforeEach(() => {
    service = { execute: jest.fn() };
    controller = new RemoveOperationalAerodromeController(
      service as unknown as RemoveOperationalAerodromeService,
    );
  });

  it('is defined', () => {
    expect(controller).toBeDefined();
  });

  // TODO: casos de sucesso e erro
});
