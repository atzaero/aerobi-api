import { validateLandingSchedule } from './validate-landing-schedule.util';

const NOW = new Date('2026-07-10T00:00:00.000Z');
const at = (hours: number): Date =>
  new Date(NOW.getTime() + hours * 60 * 60 * 1000);

describe('validateLandingSchedule', () => {
  it('janela válida (decolagem futura, pouso ≥ 3h e depois da decolagem, saída depois do pouso) → null', () => {
    expect(validateLandingSchedule(at(1), at(4), at(5), NOW)).toBeNull();
  });

  it('decolagem no passado', () => {
    expect(validateLandingSchedule(at(-1), at(4), at(5), NOW)).toMatch(
      /decolagem deve ser posterior/,
    );
  });

  it('pouso no passado', () => {
    expect(validateLandingSchedule(at(1), at(-1), at(5), NOW)).toMatch(
      /pouso deve ser posterior/,
    );
  });

  it('pouso antes da decolagem', () => {
    expect(validateLandingSchedule(at(5), at(4), at(6), NOW)).toMatch(
      /pouso deve ser depois da previsão de decolagem/,
    );
  });

  it('pouso com menos de 3h de antecedência', () => {
    expect(validateLandingSchedule(at(1), at(2), at(6), NOW)).toMatch(
      /pelo menos 3 horas/,
    );
  });

  it('saída antes/igual ao pouso', () => {
    expect(validateLandingSchedule(at(1), at(4), at(3), NOW)).toMatch(
      /partida deve ser depois da previsão de pouso/,
    );
  });
});
