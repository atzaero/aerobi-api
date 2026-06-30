import {
  AerodromeGeojsonKind,
  AerodromeGeojsonStatus,
} from '@/generated/prisma/client';

import type { CreateAerodromeGeojsonDTO } from '../dtos/create-aerodrome-geojson.dto';

import {
  buildAerodromeGeojsonCreateInput,
  patchAerodromeGeojsonToPrisma,
} from './aerodrome-geojson.prisma.mapper';

describe('aerodrome-geojson prisma mapper', () => {
  const aid = 'e5f6a7b8-c9d0-1234-ef56-789012345678';

  const baseCreate = (): CreateAerodromeGeojsonDTO => ({
    aerodromeId: aid,
    kind: AerodromeGeojsonKind.AERODROME_MAP,
    status: AerodromeGeojsonStatus.READY,
    geoJsonBytes: 0,
    featureCount: 0,
  });

  it('build inclui geoJson como InputJsonValue quando definido', () => {
    const fc = { type: 'FeatureCollection', features: [] };
    const input = buildAerodromeGeojsonCreateInput({
      ...baseCreate(),
      geoJson: fc,
    });
    expect(input.geoJson).toEqual(fc);
    expect(input.aerodrome).toEqual({ connect: { id: aid } });
  });

  it('patch com geoJson aplica InputJsonValue', () => {
    const obj = { a: 1 };
    expect(patchAerodromeGeojsonToPrisma({ geoJson: obj }).geoJson).toEqual(
      obj,
    );
  });
});
