import { AerodromeGeojsonRepository } from '../repositories/aerodrome-geojson.repository';
import { FindAerodromeGeojsonByIdService } from './find-aerodrome-geojson-by-id.service';

describe('FindAerodromeGeojsonByIdService', () => {
  let service: FindAerodromeGeojsonByIdService;

  beforeEach(() => {
    const repo = {} as unknown as AerodromeGeojsonRepository;
    service = new FindAerodromeGeojsonByIdService(repo);
  });

  it('is defined', () => {
    expect(service).toBeDefined();
  });

  // TODO: casos de sucesso e erro
});
