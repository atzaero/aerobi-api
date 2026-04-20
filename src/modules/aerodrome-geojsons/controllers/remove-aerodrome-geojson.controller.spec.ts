import { RemoveAerodromeGeojsonService } from '../services/remove-aerodrome-geojson.service';
import { RemoveAerodromeGeojsonController } from './remove-aerodrome-geojson.controller';

describe('RemoveAerodromeGeojsonController', () => {
  let controller: RemoveAerodromeGeojsonController;
  let service: jest.Mocked<Pick<RemoveAerodromeGeojsonService, 'execute'>>;

  beforeEach(() => {
    service = { execute: jest.fn() };
    controller = new RemoveAerodromeGeojsonController(
      service as unknown as RemoveAerodromeGeojsonService,
    );
  });

  it('is defined', () => {
    expect(controller).toBeDefined();
  });

  // TODO: casos de sucesso e erro
});
