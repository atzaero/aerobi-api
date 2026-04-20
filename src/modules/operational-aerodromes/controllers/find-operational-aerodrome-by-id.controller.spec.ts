import { FindOperationalAerodromeByIdService } from '../services/find-operational-aerodrome-by-id.service';
import { FindOperationalAerodromeByIdController } from './find-operational-aerodrome-by-id.controller';

describe('FindOperationalAerodromeByIdController', () => {
  let controller: FindOperationalAerodromeByIdController;
  let service: jest.Mocked<
    Pick<FindOperationalAerodromeByIdService, 'execute'>
  >;

  beforeEach(() => {
    service = { execute: jest.fn() };
    controller = new FindOperationalAerodromeByIdController(
      service as unknown as FindOperationalAerodromeByIdService,
    );
  });

  it('is defined', () => {
    expect(controller).toBeDefined();
  });

  // TODO: casos de sucesso e erro
});
