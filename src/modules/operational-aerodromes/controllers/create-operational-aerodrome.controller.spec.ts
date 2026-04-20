import { CreateOperationalAerodromeService } from '../services/create-operational-aerodrome.service';
import { CreateOperationalAerodromeController } from './create-operational-aerodrome.controller';

describe('CreateOperationalAerodromeController', () => {
  let controller: CreateOperationalAerodromeController;
  let service: jest.Mocked<Pick<CreateOperationalAerodromeService, 'execute'>>;

  beforeEach(() => {
    service = { execute: jest.fn() };
    controller = new CreateOperationalAerodromeController(
      service as unknown as CreateOperationalAerodromeService,
    );
  });

  it('is defined', () => {
    expect(controller).toBeDefined();
  });

  // TODO: casos de sucesso e erro
});
