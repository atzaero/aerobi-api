import { AerodromeMapper } from './aerodrome.mapper';
import { buildAerodromeWithGroupFixture } from '../testing/aerodrome.entity.fixture';

describe('AerodromeMapper', () => {
  it('toPublicApiRow omite campos sensíveis e mantém groupId', () => {
    const entity = buildAerodromeWithGroupFixture({
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

  it('toPublicApiRows projeta a coleção', () => {
    const entities = [
      buildAerodromeWithGroupFixture({ id: 'a-1', isView: true }),
      buildAerodromeWithGroupFixture({ id: 'a-2', isView: true }),
    ];
    expect(AerodromeMapper.toPublicApiRows(entities)).toHaveLength(2);
  });
});
