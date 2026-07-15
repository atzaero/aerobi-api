import { buildMovementsWhere } from './build-movements-where';

describe('buildMovementsWhere', () => {
  it('vazio quando sem filtros', () => {
    expect(buildMovementsWhere({})).toEqual({});
  });

  it('normaliza registration para a forma canônica (sem hífen)', () => {
    expect(buildMovementsWhere({ registration: 'PR-ZTT' })).toEqual({
      registration: 'PRZTT',
    });
  });

  it('mapeia todos os filtros e o intervalo de datas (limites UTC do dia)', () => {
    const where = buildMovementsWhere({
      registration: 'PRZTT',
      aerodrome: 'SSCF',
      reading_status: 'APPROVED',
      operation_type: 'TAKEOFF',
      source: 'MANUAL',
      conformity_status: 'NON_CONFORMANT',
      start_date: '2026-05-01',
      end_date: '2026-05-31',
    });

    expect(where).toEqual({
      registration: 'PRZTT',
      aerodrome: 'SSCF',
      readingStatus: 'APPROVED',
      operationType: 'TAKEOFF',
      source: 'MANUAL',
      conformityStatus: 'NON_CONFORMANT',
      readingDatetime: {
        gte: new Date('2026-05-01T00:00:00.000Z'),
        lte: new Date('2026-05-31T23:59:59.999Z'),
      },
    });
  });

  it('aceita apenas start_date (só limite inferior)', () => {
    const where = buildMovementsWhere({ start_date: '2026-05-01' });
    expect(where.readingDatetime).toEqual({
      gte: new Date('2026-05-01T00:00:00.000Z'),
    });
  });

  it('não inclui chaves de filtros ausentes', () => {
    const where = buildMovementsWhere({ aerodrome: 'SSCF' });
    expect(where).not.toHaveProperty('operationType');
    expect(where).not.toHaveProperty('source');
    expect(where).not.toHaveProperty('conformityStatus');
    expect(where).not.toHaveProperty('readingDatetime');
  });
});
