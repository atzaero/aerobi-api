import { isValidYmdDate } from './is-ymd-date.validator';

describe('isValidYmdDate', () => {
  it('aceita datas de calendário válidas', () => {
    expect(isValidYmdDate('2026-05-01')).toBe(true);
    expect(isValidYmdDate('2026-12-31')).toBe(true);
    expect(isValidYmdDate('2024-02-29')).toBe(true); // ano bissexto
  });

  it('rejeita formato inválido', () => {
    expect(isValidYmdDate('2026-5-1')).toBe(false);
    expect(isValidYmdDate('01/05/2026')).toBe(false);
    expect(isValidYmdDate('2026-05-01T00:00:00Z')).toBe(false);
    expect(isValidYmdDate('')).toBe(false);
  });

  it('rejeita datas impossíveis que passam no formato', () => {
    expect(isValidYmdDate('2026-13-45')).toBe(false);
    expect(isValidYmdDate('2026-02-31')).toBe(false); // não coage p/ 03-03
    expect(isValidYmdDate('2026-00-10')).toBe(false);
    expect(isValidYmdDate('2025-02-29')).toBe(false); // não bissexto
  });

  it('rejeita não-strings', () => {
    expect(isValidYmdDate(20260501)).toBe(false);
    expect(isValidYmdDate(null)).toBe(false);
    expect(isValidYmdDate(undefined)).toBe(false);
  });
});
