import { buildTechnicalVisitScopedWhere } from './build-technical-visit-scoped-where';

describe('buildTechnicalVisitScopedWhere', () => {
  it('scope none retorna lista vazia', () => {
    expect(buildTechnicalVisitScopedWhere({}, { kind: 'none' })).toEqual({
      id: { in: [] },
    });
  });

  it('scope group filtra aeródromos do grupo', () => {
    expect(
      buildTechnicalVisitScopedWhere({}, { kind: 'group', groupId: 'g1' }),
    ).toEqual({
      aerodrome: { groupId: 'g1' },
    });
  });

  it('aerodromeId fora do grupo retorna where restritivo (lista vazia na prática)', () => {
    const where = buildTechnicalVisitScopedWhere(
      { aerodromeId: 'a-outro-grupo' },
      { kind: 'group', groupId: 'g1' },
    );
    expect(where).toEqual({
      aerodromeId: 'a-outro-grupo',
      aerodrome: { groupId: 'g1' },
    });
  });

  it('search aplica OR case-insensitive', () => {
    const where = buildTechnicalVisitScopedWhere(
      { search: ' goi ' },
      { kind: 'all' },
    );
    expect(where.OR).toEqual([
      { visitorName: { contains: 'goi', mode: 'insensitive' } },
      { city: { contains: 'goi', mode: 'insensitive' } },
      { aerodrome: { icao: { contains: 'goi', mode: 'insensitive' } } },
      { aerodrome: { name: { contains: 'goi', mode: 'insensitive' } } },
    ]);
  });
});
