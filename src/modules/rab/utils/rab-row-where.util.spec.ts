import { buildRabRowWhereFromQuery } from './rab-row-where.util';

import type { RabRowsFindAllQueryDTO } from '../dtos/rab-rows-find-all-query.dto';

describe('buildRabRowWhereFromQuery', () => {
  it('returns only period when no filters', () => {
    const q = {} as RabRowsFindAllQueryDTO;
    expect(buildRabRowWhereFromQuery(q, '2026-03')).toEqual({
      period: '2026-03',
    });
  });

  it('adds contains filters when set', () => {
    const q = {
      marcas: ' PP- ',
      nrCertMatricula: 'abc',
    } as RabRowsFindAllQueryDTO;
    const where = buildRabRowWhereFromQuery(q, '2026-03');
    expect(where.period).toBe('2026-03');
    expect(where.marcas).toEqual({
      contains: 'PP-',
      mode: 'insensitive',
    });
    expect(where.nrCertMatricula).toEqual({
      contains: 'abc',
      mode: 'insensitive',
    });
  });

  it('ignores empty or whitespace-only filter strings', () => {
    const q = {
      marcas: '   ',
      dsModelo: '',
    } as RabRowsFindAllQueryDTO;
    expect(buildRabRowWhereFromQuery(q, '2026-03')).toEqual({
      period: '2026-03',
    });
  });
});
