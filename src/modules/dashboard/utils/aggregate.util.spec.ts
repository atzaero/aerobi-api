import {
  averageOrNull,
  bucketStart,
  countByStatus,
  sumBy,
  timeSeriesByPeriod,
} from './aggregate.util';

describe('countByStatus', () => {
  it('conta por chave e ignora chaves null/undefined', () => {
    const items = [
      { s: 'a' },
      { s: 'a' },
      { s: 'b' },
      { s: null },
      { s: undefined },
    ];
    expect(countByStatus(items, (i) => i.s)).toEqual({ a: 2, b: 1 });
  });

  it('lista vazia → objeto vazio (chaves com 0 omitidas)', () => {
    expect(countByStatus([], (i: { s: string }) => i.s)).toEqual({});
  });
});

describe('sumBy / averageOrNull', () => {
  it('sumBy ignora valores não-finitos/ausentes', () => {
    const items = [{ v: 10 }, { v: null }, { v: NaN }, { v: 5 }];
    expect(sumBy(items, (i) => i.v)).toBe(15);
  });

  it('averageOrNull arredonda a média', () => {
    expect(averageOrNull([10, 20, 31])).toBe(20);
  });

  it('averageOrNull de lista vazia → null', () => {
    expect(averageOrNull([])).toBeNull();
  });
});

describe('bucketStart (UTC, semana=domingo)', () => {
  it('day → meia-noite UTC do dia', () => {
    const ms = Date.UTC(2026, 6, 8, 15, 30);
    expect(bucketStart(ms, 'day')).toBe(Date.UTC(2026, 6, 8));
  });

  it('week → domingo anterior (2021-01-06 quarta → 2021-01-03 domingo)', () => {
    const wed = Date.UTC(2021, 0, 6, 12);
    expect(bucketStart(wed, 'week')).toBe(Date.UTC(2021, 0, 3));
  });

  it('week → um domingo permanece nele mesmo', () => {
    const sun = Date.UTC(2021, 0, 3, 9);
    expect(bucketStart(sun, 'week')).toBe(Date.UTC(2021, 0, 3));
  });

  it('month → primeiro dia do mês UTC', () => {
    expect(bucketStart(Date.UTC(2026, 6, 20), 'month')).toBe(
      Date.UTC(2026, 6, 1),
    );
  });
});

describe('timeSeriesByPeriod', () => {
  it('bucketiza por dia, ordena por tempo e ignora timestamps inválidos', () => {
    const items = [
      { at: Date.UTC(2026, 6, 8, 1) },
      { at: Date.UTC(2026, 6, 8, 23) },
      { at: Date.UTC(2026, 6, 7, 5) },
      { at: null },
    ];
    const series = timeSeriesByPeriod(items, (i) => i.at, 'day');
    expect(series.granularity).toBe('day');
    expect(series.points).toEqual([
      { bucket: Date.UTC(2026, 6, 7), count: 1 },
      { bucket: Date.UTC(2026, 6, 8), count: 2 },
    ]);
  });
});
