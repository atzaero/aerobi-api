import { GeojsonKind, GeojsonStatus } from '@/generated/prisma/client';

import type { CreateGeojsonDTO } from '../dtos/create-geojson.dto';
import { buildGeojsonCreateInput } from '../mappers/geojson.prisma.mapper';
import type { GeojsonRepository } from '../repositories/geojson.repository';
import { buildGeojsonFixture } from '../testing/geojson.entity.fixture';

import { CreateGeojsonService } from './create-geojson.service';

describe('CreateGeojsonService', () => {
  let service: CreateGeojsonService;
  let create: jest.Mock;

  beforeEach(() => {
    create = jest.fn();
    const repo = { create } as unknown as GeojsonRepository;
    service = new CreateGeojsonService(repo);
  });

  it('persistência com geoJson inline', async () => {
    const geoJson = {
      type: 'FeatureCollection',
      features: [{ type: 'Feature', properties: {}, geometry: null }],
    };
    const dto: CreateGeojsonDTO = {
      aerodromeId: '22222222-2222-4222-8222-222222222222',
      kind: GeojsonKind.AERODROME_MAP,
      status: GeojsonStatus.READY,
      geoJson,
      geoJsonBytes: 100,
    };
    const saved = buildGeojsonFixture({
      geoJson,
      geoJsonBytes: 100,
    });
    create.mockResolvedValue(saved);

    const out = await service.execute(dto);

    expect(create).toHaveBeenCalledWith(buildGeojsonCreateInput(dto));
    expect(out.id).toBe(saved.id);
    expect(out.status).toBe(GeojsonStatus.READY);
  });
});
