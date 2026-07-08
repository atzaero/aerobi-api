import { buildTechnicalVisitWithAerodromeFixture } from '../testing/technical-visit.entity.fixture';

import { TechnicalVisitMapper } from './technical-visit.mapper';

describe('TechnicalVisitMapper.toApiRow', () => {
  it('projeta uf/icao/aerodromeName do aeródromo e datas em ISO', () => {
    const entity = buildTechnicalVisitWithAerodromeFixture({
      visitAt: new Date('2024-06-01T09:00:00.000Z'),
    });

    const row = TechnicalVisitMapper.toApiRow(entity, []);

    expect(row.id).toBe(entity.id);
    expect(row.aerodromeId).toBe(entity.aerodromeId);
    expect(row.uf).toBe(entity.aerodrome.group.uf ?? null);
    expect(row.icao).toBe(entity.aerodrome.icao);
    expect(row.aerodromeName).toBe(entity.aerodrome.name);
    expect(row.visitAt).toBe(entity.visitAt.toISOString());
    expect(row.createdAt).toBe(entity.createdAt.toISOString());
    expect(row.modifiers).toEqual([]);
    expect(row.deletedAt).toBeNull();
  });

  it('deletedAt em ISO quando soft-deletado', () => {
    const deletedAt = new Date('2024-06-05T10:00:00.000Z');
    const entity = buildTechnicalVisitWithAerodromeFixture({ deletedAt });

    const row = TechnicalVisitMapper.toApiRow(entity, []);

    expect(row.deletedAt).toBe(deletedAt.toISOString());
  });
});
