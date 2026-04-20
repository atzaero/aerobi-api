import { ListAerodromeGeojsonsService } from '../services/list-aerodrome-geojsons.service';
import { ListAerodromeGeojsonsController } from './list-aerodrome-geojsons.controller';

describe('ListAerodromeGeojsonsController', () => {
  let controller: ListAerodromeGeojsonsController;
  let service: jest.Mocked<Pick<ListAerodromeGeojsonsService, 'execute'>>;

  beforeEach(() => {
    service = { execute: jest.fn() };
    controller = new ListAerodromeGeojsonsController(
      service as unknown as ListAerodromeGeojsonsService,
    );
  });

  it('is defined', () => {
    expect(controller).toBeDefined();
  });

  // TODO: casos de sucesso e erro
});
