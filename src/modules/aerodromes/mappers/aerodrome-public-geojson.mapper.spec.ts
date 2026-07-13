import {
  GeojsonKind,
  GeojsonMapFileType,
  GeojsonStatus,
} from '@/generated/prisma/client';

import { AerodromePublicGeojsonMapper } from './aerodrome-public-geojson.mapper';

const featureCollection = {
  type: 'FeatureCollection',
  features: [],
};

describe('AerodromePublicGeojsonMapper', () => {
  it('projeta subset READY parseável (kind lowercase, mapFileType)', () => {
    const out = AerodromePublicGeojsonMapper.toPublic({
      status: GeojsonStatus.READY,
      kind: GeojsonKind.AERODROME_MAP,
      mapFileType: GeojsonMapFileType.KML,
      geoJson: featureCollection,
    });

    expect(out).toEqual({
      kind: 'aerodrome_map',
      mapFileType: 'kml',
      geoJson: featureCollection,
    });
  });

  it('mapFileType KMZ → kmz', () => {
    const out = AerodromePublicGeojsonMapper.toPublic({
      status: GeojsonStatus.READY,
      kind: GeojsonKind.AERODROME_MAP,
      mapFileType: GeojsonMapFileType.KMZ,
      geoJson: featureCollection,
    });
    expect(out?.mapFileType).toBe('kmz');
  });

  it('null quando relação ausente', () => {
    expect(AerodromePublicGeojsonMapper.toPublic(null)).toBeNull();
  });

  it('null quando status ≠ READY', () => {
    expect(
      AerodromePublicGeojsonMapper.toPublic({
        status: GeojsonStatus.ERROR,
        kind: GeojsonKind.AERODROME_MAP,
        mapFileType: GeojsonMapFileType.KML,
        geoJson: featureCollection,
      }),
    ).toBeNull();
  });

  it('null quando mapFileType é null (READY + geoJson ok)', () => {
    expect(
      AerodromePublicGeojsonMapper.toPublic({
        status: GeojsonStatus.READY,
        kind: GeojsonKind.AERODROME_MAP,
        mapFileType: null,
        geoJson: featureCollection,
      }),
    ).toBeNull();
  });

  it('null quando geoJson ilegível', () => {
    expect(
      AerodromePublicGeojsonMapper.toPublic({
        status: GeojsonStatus.READY,
        kind: GeojsonKind.AERODROME_MAP,
        mapFileType: GeojsonMapFileType.KML,
        geoJson: 'not-json',
      }),
    ).toBeNull();
  });
});
