import { AerodromeGeojsonRepository } from '../repositories/aerodrome-geojson.repository';
import { RemoveAerodromeGeojsonService } from './remove-aerodrome-geojson.service';

describe('RemoveAerodromeGeojsonService', () => {
  let service: RemoveAerodromeGeojsonService;

  beforeEach(() => {
    const repo = {} as unknown as AerodromeGeojsonRepository;
    service = new RemoveAerodromeGeojsonService(repo);
  });

  it('is defined', () => {
    expect(service).toBeDefined();
  });

  // TODO: casos de sucesso e erro
});
