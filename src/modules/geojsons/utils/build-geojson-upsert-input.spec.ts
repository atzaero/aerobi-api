import {
  GeojsonKind,
  GeojsonMapFileType,
  GeojsonStatus,
  Prisma,
} from '@/generated/prisma/client';

import { buildGeojsonUpsertInput } from './build-geojson-upsert-input';
import type {
  GeojsonErrorContent,
  GeojsonReadyContent,
} from './geojson-content';

const identity = {
  aerodromeId: '22222222-2222-4222-8222-222222222222',
  mapFileType: GeojsonMapFileType.KML,
  sourceStoragePath: null,
  generatedAt: new Date('2026-01-01T00:00:00.000Z'),
  processingMs: 12,
  actorId: 'admin-1',
};

const readyDecision: GeojsonReadyContent = {
  status: 'READY',
  geoJson: { type: 'FeatureCollection', features: [] },
  geoJsonBytes: 42,
  featureCount: 3,
  sourceBytes: 100,
  kmlTextBytes: 80,
  zipBytes: null,
  versionHash: 'a'.repeat(64),
  errorMessage: null,
};

const errorDecision: GeojsonErrorContent = {
  status: 'ERROR',
  geoJson: null,
  geoJsonBytes: 0,
  featureCount: 0,
  errorMessage: 'boom',
};

describe('buildGeojsonUpsertInput', () => {
  it('READY: create com objeto + métricas + ator; update re-ativa (deletedAt/By null)', () => {
    const { create, update } = buildGeojsonUpsertInput(identity, readyDecision);

    expect(create).toMatchObject({
      kind: GeojsonKind.AERODROME_MAP,
      status: GeojsonStatus.READY,
      geoJson: { type: 'FeatureCollection', features: [] },
      geoJsonBytes: 42,
      featureCount: 3,
      versionHash: 'a'.repeat(64),
      createdBy: 'admin-1',
      updatedBy: 'admin-1',
      aerodrome: { connect: { id: identity.aerodromeId } },
    });
    expect(update).toMatchObject({
      status: GeojsonStatus.READY,
      updatedBy: 'admin-1',
      deletedAt: null,
      deletedBy: null,
    });
    expect(update).not.toHaveProperty('createdBy');
  });

  it('ERROR: payload zerado (geoJson = DbNull), sem métricas de origem', () => {
    const { create } = buildGeojsonUpsertInput(identity, errorDecision);

    expect(create.status).toBe(GeojsonStatus.ERROR);
    expect(create.geoJson).toBe(Prisma.DbNull);
    expect(create.geoJsonBytes).toBe(0);
    expect(create.featureCount).toBe(0);
    expect(create.errorMessage).toBe('boom');
    expect(create).not.toHaveProperty('sourceBytes');
    expect(create).not.toHaveProperty('versionHash');
  });
});
