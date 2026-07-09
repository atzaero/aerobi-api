import { bucketGranularity, resolveDashboardRange } from './date-range.util';

const DAY_MS = 24 * 60 * 60 * 1000;

describe('resolveDashboardRange', () => {
  const now = Date.UTC(2026, 6, 8);

  it.each([
    ['7d', 7],
    ['30d', 30],
    ['90d', 90],
    ['12m', 365],
  ] as const)('preset %s → janela de %s dias até now', (preset, days) => {
    const range = resolveDashboardRange({ preset }, now);
    expect(range.toMs).toBe(now);
    expect(range.fromMs).toBe(now - days * DAY_MS);
    expect(range.preset).toBe(preset);
  });

  it('custom usa from/to fornecidos', () => {
    const from = Date.UTC(2026, 0, 1);
    const to = Date.UTC(2026, 1, 1);
    expect(resolveDashboardRange({ preset: 'custom', from, to }, now)).toEqual({
      fromMs: from,
      toMs: to,
      preset: 'custom',
    });
  });

  it('custom sem from/to cai nos fallbacks defensivos (0 / now)', () => {
    expect(resolveDashboardRange({ preset: 'custom' }, now)).toEqual({
      fromMs: 0,
      toMs: now,
      preset: 'custom',
    });
  });
});

describe('bucketGranularity', () => {
  const base = Date.UTC(2026, 6, 8);
  const withSpan = (days: number) =>
    bucketGranularity({
      fromMs: base,
      toMs: base + days * DAY_MS,
      preset: 'custom',
    });

  it('até 31 dias → day (inclusive no limite)', () => {
    expect(withSpan(31)).toBe('day');
  });

  it('acima de 31 e até 92 dias → week (inclusive no limite)', () => {
    expect(withSpan(32)).toBe('week');
    expect(withSpan(92)).toBe('week');
  });

  it('acima de 92 dias → month', () => {
    expect(withSpan(93)).toBe('month');
  });
});
