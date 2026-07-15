import {
  GeojsonKind,
  GeojsonMapFileType,
  GeojsonStatus,
} from '@/generated/prisma/client';

import {
  buildAerodromeVisibleWithGroupFixture,
  buildAerodromeWithGroupFixture,
} from '../testing/aerodrome.entity.fixture';

import { AerodromeMapper } from './aerodrome.mapper';

describe('AerodromeMapper', () => {
  it('toPublicApiRow omite campos sensíveis e mantém groupId', () => {
    const entity = buildAerodromeVisibleWithGroupFixture({
      isView: true,
      emergencyPhone: '+5511999999999',
      createdBy: 'actor-1',
      updatedBy: 'actor-2',
      deletedBy: null,
      deletedAt: null,
      registrationOrdinanceUrl: 'https://secret/reg.pdf',
      planOrdinanceUrl: 'https://secret/plan.pdf',
      grantTermUrl: 'https://secret/grant.pdf',
      aeronauticalStudyUrl: 'https://secret/study.pdf',
    });

    const row = AerodromeMapper.toPublicApiRow(entity);

    expect(row.groupId).toBe(entity.groupId);
    expect(row.icao).toBe(entity.icao);
    expect(row.geojson).toBeNull();
    expect(row).not.toHaveProperty('isView');
    expect(row).not.toHaveProperty('emergencyPhone');
    expect(row).not.toHaveProperty('createdBy');
    expect(row).not.toHaveProperty('updatedBy');
    expect(row).not.toHaveProperty('deletedBy');
    expect(row).not.toHaveProperty('deletedAt');
    expect(row).not.toHaveProperty('registrationOrdinanceUrl');
    expect(row).not.toHaveProperty('planOrdinanceUrl');
    expect(row).not.toHaveProperty('grantTermUrl');
    expect(row).not.toHaveProperty('aeronauticalStudyUrl');
  });

  it('toPublicApiRow aninha geojson READY', () => {
    const featureCollection = { type: 'FeatureCollection', features: [] };
    const entity = buildAerodromeVisibleWithGroupFixture({
      isView: true,
      geojson: {
        status: GeojsonStatus.READY,
        kind: GeojsonKind.AERODROME_MAP,
        mapFileType: GeojsonMapFileType.KML,
        geoJson: featureCollection,
      },
    });

    const row = AerodromeMapper.toPublicApiRow(entity);
    expect(row.geojson).toEqual({
      kind: 'aerodrome_map',
      mapFileType: 'kml',
      geoJson: featureCollection,
    });
  });

  it('toPublicApiRows projeta a coleção', () => {
    const entities = [
      buildAerodromeVisibleWithGroupFixture({ id: 'a-1', isView: true }),
      buildAerodromeVisibleWithGroupFixture({ id: 'a-2', isView: true }),
    ];
    expect(AerodromeMapper.toPublicApiRows(entities)).toHaveLength(2);
  });

  it('toApiRow mantém projeção admin sem geojson', () => {
    const entity = buildAerodromeWithGroupFixture({ isView: true });
    const row = AerodromeMapper.toApiRow(entity);
    expect(row.isView).toBe(true);
    expect(row).not.toHaveProperty('geojson');
  });
});
