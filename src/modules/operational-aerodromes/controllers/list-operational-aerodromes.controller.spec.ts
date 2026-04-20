import { ListOperationalAerodromesService } from '../services/list-operational-aerodromes.service';
import { ListOperationalAerodromesController } from './list-operational-aerodromes.controller';

describe('ListOperationalAerodromesController', () => {
  let controller: ListOperationalAerodromesController;
  let service: jest.Mocked<Pick<ListOperationalAerodromesService, 'execute'>>;

  beforeEach(() => {
    service = { execute: jest.fn() };
    controller = new ListOperationalAerodromesController(
      service as unknown as ListOperationalAerodromesService,
    );
  });

  it('is defined', () => {
    expect(controller).toBeDefined();
  });

  // TODO: casos de sucesso e erro
});
