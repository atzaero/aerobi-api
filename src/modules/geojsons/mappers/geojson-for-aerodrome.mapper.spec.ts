import {
  GeojsonMapFileType,
  GeojsonStatus,
  Uf,
} from '@/generated/prisma/client';

import type { GeojsonWithAerodrome } from '../repositories/geojson.repository.interface';
import { buildGeojsonFixture } from '../testing/geojson.entity.fixture';

import { GeojsonForAerodromeMapper } from './geojson-for-aerodrome.mapper';

const aerodromeId = '22222222-2222-4222-8222-222222222222';

function buildWithAerodrome(
  overrides: Partial<GeojsonWithAerodrome> = {},
): GeojsonWithAerodrome {
  return {
    ...buildGeojsonFixture({
      aerodromeId,
      status: GeojsonStatus.READY,
      mapFileType: GeojsonMapFileType.KMZ,
      generatedAt: new Date('2026-01-02T03:04:05.000Z'),
    }),
    aerodrome: { icao: 'sbsp', groupId: 'grp-1', group: { uf: Uf.SP } },
    ...overrides,
  };
}

describe('GeojsonForAerodromeMapper', () => {
  const geoJson = { type: 'FeatureCollection', features: [] };

  it('deriva campos do aeródromo e expõe enums lowercase', () => {
    const out = GeojsonForAerodromeMapper.toResponse(
      buildWithAerodrome(),
      geoJson,
    );
    expect(out).toMatchObject({
      docId: aerodromeId,
      icao: 'SBSP',
      stateId: 'SP',
      groupId: 'grp-1',
      kind: 'aerodrome_map',
      mapFileType: 'kmz',
      generatedAt: '2026-01-02T03:04:05.000Z',
    });
    expect(out.geoJson).toBe(geoJson);
  });

  it('mapFileType null → kml (default de paridade)', () => {
    const out = GeojsonForAerodromeMapper.toResponse(
      buildWithAerodrome({ mapFileType: null }),
      geoJson,
    );
    expect(out.mapFileType).toBe('kml');
  });

  it('generatedAt ausente → fallback em updatedAt', () => {
    const out = GeojsonForAerodromeMapper.toResponse(
      buildWithAerodrome({
        generatedAt: null,
        updatedAt: new Date('2026-05-05T00:00:00.000Z'),
      }),
      geoJson,
    );
    expect(out.generatedAt).toBe('2026-05-05T00:00:00.000Z');
  });
});
