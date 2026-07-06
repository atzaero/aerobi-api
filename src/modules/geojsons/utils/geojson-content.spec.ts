import type { ConvertedAerodromeSource } from './convert-aerodrome-source';
import {
  decideGeojsonContent,
  isGeoJsonObject,
  parseGeoJsonField,
} from './geojson-content';
import { MAX_GEOJSON_INLINE_UTF8_BYTES } from './geojson.constants';

const converted = (
  overrides: Partial<ConvertedAerodromeSource> = {},
): ConvertedAerodromeSource => ({
  geoJson: { type: 'FeatureCollection', features: [] },
  geoJsonRaw: '{"type":"FeatureCollection","features":[]}',
  geoJsonBytes: 42,
  featureCount: 0,
  sourceBytes: 100,
  kmlTextBytes: 80,
  zipBytes: null,
  ...overrides,
});

describe('isGeoJsonObject', () => {
  it('só objeto (não array/escalar/null)', () => {
    expect(isGeoJsonObject({ type: 'FeatureCollection' })).toBe(true);
    expect(isGeoJsonObject([])).toBe(false);
    expect(isGeoJsonObject(null)).toBe(false);
    expect(isGeoJsonObject('x')).toBe(false);
  });
});

describe('parseGeoJsonField', () => {
  it('aceita objeto', () => {
    const obj = { type: 'FeatureCollection' };
    expect(parseGeoJsonField(obj)).toBe(obj);
  });
  it('aceita string JSON de objeto', () => {
    expect(parseGeoJsonField('{"type":"FeatureCollection"}')).toEqual({
      type: 'FeatureCollection',
    });
  });
  it('rejeita string inválida, array e escalar → null', () => {
    expect(parseGeoJsonField('{oops')).toBeNull();
    expect(parseGeoJsonField('[]')).toBeNull();
    expect(parseGeoJsonField(3)).toBeNull();
  });
});

describe('decideGeojsonContent', () => {
  it('abaixo do limite → READY com métricas e versionHash', () => {
    const decision = decideGeojsonContent(converted());
    expect(decision.status).toBe('READY');
    if (decision.status === 'READY') {
      expect(decision.geoJson).toEqual({
        type: 'FeatureCollection',
        features: [],
      });
      expect(decision.versionHash).toMatch(/^[a-f0-9]{64}$/);
      expect(decision.sourceBytes).toBe(100);
    }
  });

  it('acima do limite (> estrito) → ERROR com payload zerado', () => {
    const decision = decideGeojsonContent(
      converted({ geoJsonBytes: MAX_GEOJSON_INLINE_UTF8_BYTES + 1 }),
    );
    expect(decision.status).toBe('ERROR');
    if (decision.status === 'ERROR') {
      expect(decision.geoJson).toBeNull();
      expect(decision.geoJsonBytes).toBe(0);
      expect(decision.featureCount).toBe(0);
      expect(decision.errorMessage).toContain('excede o limite inline');
    }
  });

  it('exatamente no limite → READY (não é > estrito)', () => {
    const decision = decideGeojsonContent(
      converted({ geoJsonBytes: MAX_GEOJSON_INLINE_UTF8_BYTES }),
    );
    expect(decision.status).toBe('READY');
  });
});
