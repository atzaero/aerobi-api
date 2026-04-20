import { AerodromeGeojsonRepository } from '../repositories/aerodrome-geojson.repository';
import { ListAerodromeGeojsonsService } from './list-aerodrome-geojsons.service';

describe('ListAerodromeGeojsonsService', () => {
  let service: ListAerodromeGeojsonsService;

  beforeEach(() => {
    const repo = {} as unknown as AerodromeGeojsonRepository;
    service = new ListAerodromeGeojsonsService(repo);
  });

  it('is defined', () => {
    expect(service).toBeDefined();
  });

  // TODO: casos de sucesso e erro
});
