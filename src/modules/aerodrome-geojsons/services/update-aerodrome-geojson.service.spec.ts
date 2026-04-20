import { AerodromeGeojsonRepository } from '../repositories/aerodrome-geojson.repository';
import { UpdateAerodromeGeojsonService } from './update-aerodrome-geojson.service';

describe('UpdateAerodromeGeojsonService', () => {
  let service: UpdateAerodromeGeojsonService;

  beforeEach(() => {
    const repo = {} as unknown as AerodromeGeojsonRepository;
    service = new UpdateAerodromeGeojsonService(repo);
  });

  it('is defined', () => {
    expect(service).toBeDefined();
  });

  // TODO: casos de sucesso e erro
});
