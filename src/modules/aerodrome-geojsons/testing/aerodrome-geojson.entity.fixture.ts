import {
  AerodromeGeojsonKind,
  AerodromeGeojsonStatus,
  type AerodromeGeojson,
} from '@/generated/prisma/client';

const t = new Date('2024-06-01T12:00:00.000Z');

export function buildAerodromeGeojsonFixture(
  overrides: Partial<AerodromeGeojson> = {},
): AerodromeGeojson {
  return {
    id: '11111111-1111-4111-8111-111111111111',
    aerodromeId: '22222222-2222-4222-8222-222222222222',
    kind: AerodromeGeojsonKind.AERODROME_MAP,
    status: AerodromeGeojsonStatus.READY,
    geoJson: { type: 'FeatureCollection', features: [] },
    geoJsonBytes: 2,
    featureCount: 0,
    mapFileType: null,
    sourceStoragePath: null,
    sourceUpdatedAt: null,
    geoJsonStoragePath: null,
    versionHash: null,
    errorMessage: null,
    processingMs: null,
    sourceBytes: null,
    kmlTextBytes: null,
    zipBytes: null,
    generatedAt: t,
    createdAt: t,
    createdBy: null,
    updatedAt: t,
    updatedBy: null,
    deletedAt: null,
    deletedBy: null,
    ...overrides,
  };
}
