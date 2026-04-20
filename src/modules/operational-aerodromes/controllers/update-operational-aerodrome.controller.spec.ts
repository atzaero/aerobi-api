import { UpdateOperationalAerodromeService } from '../services/update-operational-aerodrome.service';
import { UpdateOperationalAerodromeController } from './update-operational-aerodrome.controller';

describe('UpdateOperationalAerodromeController', () => {
  let controller: UpdateOperationalAerodromeController;
  let service: jest.Mocked<Pick<UpdateOperationalAerodromeService, 'execute'>>;

  beforeEach(() => {
    service = { execute: jest.fn() };
    controller = new UpdateOperationalAerodromeController(
      service as unknown as UpdateOperationalAerodromeService,
    );
  });

  it('is defined', () => {
    expect(controller).toBeDefined();
  });

  // TODO: casos de sucesso e erro
});
