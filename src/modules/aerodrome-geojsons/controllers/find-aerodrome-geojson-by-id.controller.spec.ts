import { FindAerodromeGeojsonByIdService } from '../services/find-aerodrome-geojson-by-id.service';
import { FindAerodromeGeojsonByIdController } from './find-aerodrome-geojson-by-id.controller';

describe('FindAerodromeGeojsonByIdController', () => {
  let controller: FindAerodromeGeojsonByIdController;
  let service: jest.Mocked<Pick<FindAerodromeGeojsonByIdService, 'execute'>>;

  beforeEach(() => {
    service = { execute: jest.fn() };
    controller = new FindAerodromeGeojsonByIdController(
      service as unknown as FindAerodromeGeojsonByIdService,
    );
  });

  it('is defined', () => {
    expect(controller).toBeDefined();
  });

  // TODO: casos de sucesso e erro
});
