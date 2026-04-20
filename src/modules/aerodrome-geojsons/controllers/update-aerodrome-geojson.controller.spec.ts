import { UpdateAerodromeGeojsonService } from '../services/update-aerodrome-geojson.service';
import { UpdateAerodromeGeojsonController } from './update-aerodrome-geojson.controller';

describe('UpdateAerodromeGeojsonController', () => {
  let controller: UpdateAerodromeGeojsonController;
  let service: jest.Mocked<Pick<UpdateAerodromeGeojsonService, 'execute'>>;

  beforeEach(() => {
    service = { execute: jest.fn() };
    controller = new UpdateAerodromeGeojsonController(
      service as unknown as UpdateAerodromeGeojsonService,
    );
  });

  it('is defined', () => {
    expect(controller).toBeDefined();
  });

  // TODO: casos de sucesso e erro
});
