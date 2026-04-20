import { parseDate } from './date-parser.util';

describe('parseDate', () => {
  it('retorna null para string vazia', () => {
    expect(parseDate('')).toBeNull();
    expect(parseDate('   ')).toBeNull();
  });

  it('retorna null para string undefined', () => {
    expect(parseDate(undefined as any)).toBeNull();
  });

  it('retorna null para formato inválido', () => {
    expect(parseDate('invalid')).toBeNull();
    expect(parseDate('01/01')).toBeNull();
    expect(parseDate('01/01/2023/extra')).toBeNull();
  });

  it('parseia formato DD/MM/AAAA corretamente', () => {
    const result = parseDate('15/06/2023');
    expect(result).toEqual(new Date(2023, 5, 15));
  });

  it('parseia formato DD/MM/AA corretamente (anos 2000)', () => {
    const result = parseDate('15/06/23');
    expect(result).toEqual(new Date(2023, 5, 15));
  });

  it('parseia formato DD/MM/AA corretamente (anos 1900)', () => {
    const result = parseDate('15/06/50');
    expect(result).toEqual(new Date(1950, 5, 15));
  });

  it('retorna null para dia inválido', () => {
    expect(parseDate('32/06/2023')).toBeNull();
    expect(parseDate('00/06/2023')).toBeNull();
  });

  it('retorna null para mês inválido', () => {
    expect(parseDate('15/13/2023')).toBeNull();
    expect(parseDate('15/00/2023')).toBeNull();
  });

  it('retorna null para valores não numéricos', () => {
    expect(parseDate('ab/cd/efgh')).toBeNull();
  });
});
