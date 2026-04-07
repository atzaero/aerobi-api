import { ensureArray } from './aisweb-xml-array.util';

describe('ensureArray', () => {
  it('retorna array vazio para null/undefined', () => {
    expect(ensureArray(null)).toEqual([]);
    expect(ensureArray(undefined)).toEqual([]);
  });

  it('envolve valor único em array', () => {
    expect(ensureArray('x')).toEqual(['x']);
    expect(ensureArray({ a: 1 })).toEqual([{ a: 1 }]);
  });

  it('preserva array existente', () => {
    expect(ensureArray([1, 2, 3])).toEqual([1, 2, 3]);
  });
});
