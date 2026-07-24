import { formatEmailDate } from './format-email-date.util';

describe('formatEmailDate', () => {
  it('formata em dd/mm/aaaa hh:mm UTC (sempre em UTC)', () => {
    expect(formatEmailDate(new Date('2026-07-24T21:05:00.000Z'))).toBe(
      '24/07/2026 21:05 UTC',
    );
  });

  it('faz zero-padding de dia/mês/hora/minuto', () => {
    expect(formatEmailDate(new Date('2026-01-02T03:04:00.000Z'))).toBe(
      '02/01/2026 03:04 UTC',
    );
  });

  it('retorna travessão para null/undefined', () => {
    expect(formatEmailDate(null)).toBe('—');
    expect(formatEmailDate(undefined)).toBe('—');
  });
});
