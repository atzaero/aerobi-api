import { toLocalCivilDate } from './civil-date.util';

describe('toLocalCivilDate', () => {
  it('formata uma Date (componentes locais) como yyyy-MM-dd com zero-padding', () => {
    expect(toLocalCivilDate(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect(toLocalCivilDate(new Date(2026, 10, 30))).toBe('2026-11-30');
  });

  it('aceita epoch em milissegundos', () => {
    const ms = new Date(2026, 1, 1, 8, 0, 0).getTime();
    expect(toLocalCivilDate(ms)).toBe('2026-02-01');
  });

  it('usa o dia civil local, independentemente da hora', () => {
    expect(toLocalCivilDate(new Date(2026, 2, 15, 23, 59, 59))).toBe(
      '2026-03-15',
    );
    expect(toLocalCivilDate(new Date(2026, 2, 15, 0, 0, 0))).toBe('2026-03-15');
  });
});
