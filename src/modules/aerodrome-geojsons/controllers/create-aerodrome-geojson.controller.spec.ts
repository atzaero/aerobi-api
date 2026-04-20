import { CreateAerodromeGeojsonService } from '../services/create-aerodrome-geojson.service';
import { CreateAerodromeGeojsonController } from './create-aerodrome-geojson.controller';

describe('CreateAerodromeGeojsonController', () => {
  let controller: CreateAerodromeGeojsonController;
  let service: jest.Mocked<Pick<CreateAerodromeGeojsonService, 'execute'>>;

  beforeEach(() => {
    service = { execute: jest.fn() };
    controller = new CreateAerodromeGeojsonController(
      service as unknown as CreateAerodromeGeojsonService,
    );
  });

  it('is defined', () => {
    expect(controller).toBeDefined();
  });

  // TODO: casos de sucesso e erro
});
