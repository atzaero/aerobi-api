import { normalizeSolDays } from './sol-xml-normalize.util';

describe('normalizeSolDays', () => {
  it('retorna array vazio quando parsed é vazio', () => {
    expect(normalizeSolDays({})).toEqual([]);
  });

  it('retorna array vazio quando aisweb.day está ausente', () => {
    expect(normalizeSolDays({ aisweb: {} })).toEqual([]);
  });

  it('retorna array vazio quando aisweb.day é null', () => {
    expect(normalizeSolDays({ aisweb: { day: null } })).toEqual([]);
  });

  it('envolve único <day> em array', () => {
    const day = { date: '2026-04-06', sunrise: '0900', sunset: '2100' };
    expect(normalizeSolDays({ aisweb: { day } })).toEqual([day]);
  });

  it('preserva array de múltiplos dias', () => {
    const days = [
      { date: '2026-04-06', sunrise: '0900', sunset: '2100' },
      { date: '2026-04-07', sunrise: '0901', sunset: '2059' },
    ];
    expect(normalizeSolDays({ aisweb: { day: days } })).toEqual(days);
  });
});
