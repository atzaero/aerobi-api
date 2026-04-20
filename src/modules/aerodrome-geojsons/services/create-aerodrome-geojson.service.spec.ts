import { AerodromeGeojsonRepository } from '../repositories/aerodrome-geojson.repository';
import { CreateAerodromeGeojsonService } from './create-aerodrome-geojson.service';

describe('CreateAerodromeGeojsonService', () => {
  let service: CreateAerodromeGeojsonService;

  beforeEach(() => {
    const repo = {} as unknown as AerodromeGeojsonRepository;
    service = new CreateAerodromeGeojsonService(repo);
  });

  it('is defined', () => {
    expect(service).toBeDefined();
  });

  // TODO: casos de sucesso e erro
});
