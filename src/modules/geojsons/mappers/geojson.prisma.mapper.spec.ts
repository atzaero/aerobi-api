import { GeojsonKind, GeojsonStatus } from '@/generated/prisma/client';

import type { CreateGeojsonDTO } from '../dtos/create-geojson.dto';

import {
  buildGeojsonCreateInput,
  patchGeojsonToPrisma,
} from './geojson.prisma.mapper';

describe('geojson prisma mapper', () => {
  const aid = 'e5f6a7b8-c9d0-1234-ef56-789012345678';

  const baseCreate = (): CreateGeojsonDTO => ({
    aerodromeId: aid,
    kind: GeojsonKind.AERODROME_MAP,
    status: GeojsonStatus.READY,
    geoJsonBytes: 0,
    featureCount: 0,
  });

  it('build inclui geoJson como InputJsonValue quando definido', () => {
    const fc = { type: 'FeatureCollection', features: [] };
    const input = buildGeojsonCreateInput({
      ...baseCreate(),
      geoJson: fc,
    });
    expect(input.geoJson).toEqual(fc);
    expect(input.aerodrome).toEqual({ connect: { id: aid } });
  });

  it('patch com geoJson aplica InputJsonValue', () => {
    const obj = { a: 1 };
    expect(patchGeojsonToPrisma({ geoJson: obj }).geoJson).toEqual(obj);
  });
});
