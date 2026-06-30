import {
  AerodromeGeojsonKind,
  AerodromeGeojsonStatus,
} from '@/generated/prisma/client';

import type { CreateAerodromeGeojsonDTO } from '../dtos/create-aerodrome-geojson.dto';
import { buildAerodromeGeojsonCreateInput } from '../mappers/aerodrome-geojson.prisma.mapper';
import type { AerodromeGeojsonRepository } from '../repositories/aerodrome-geojson.repository';
import { buildAerodromeGeojsonFixture } from '../testing/aerodrome-geojson.entity.fixture';

import { CreateAerodromeGeojsonService } from './create-aerodrome-geojson.service';

describe('CreateAerodromeGeojsonService', () => {
  let service: CreateAerodromeGeojsonService;
  let create: jest.Mock;

  beforeEach(() => {
    create = jest.fn();
    const repo = { create } as unknown as AerodromeGeojsonRepository;
    service = new CreateAerodromeGeojsonService(repo);
  });

  it('persistência com geoJson inline', async () => {
    const geoJson = {
      type: 'FeatureCollection',
      features: [{ type: 'Feature', properties: {}, geometry: null }],
    };
    const dto: CreateAerodromeGeojsonDTO = {
      aerodromeId: '22222222-2222-4222-8222-222222222222',
      kind: AerodromeGeojsonKind.AERODROME_MAP,
      status: AerodromeGeojsonStatus.READY,
      geoJson,
      geoJsonBytes: 100,
    };
    const saved = buildAerodromeGeojsonFixture({
      geoJson,
      geoJsonBytes: 100,
    });
    create.mockResolvedValue(saved);

    const out = await service.execute(dto);

    expect(create).toHaveBeenCalledWith(buildAerodromeGeojsonCreateInput(dto));
    expect(out.id).toBe(saved.id);
    expect(out.status).toBe(AerodromeGeojsonStatus.READY);
  });
});
