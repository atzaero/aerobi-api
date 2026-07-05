import {
  normalizeAircraftRegistration,
  resolveAircraftRegistration,
} from './aircraft-registration.util';

describe('normalizeAircraftRegistration', () => {
  it('formata marca brasileira como XX-XXX', () => {
    expect(normalizeAircraftRegistration('ptabc')).toBe('PT-ABC');
    expect(normalizeAircraftRegistration('PT-ABC')).toBe('PT-ABC');
  });
});

describe('resolveAircraftRegistration (nacional)', () => {
  it('aceita marca brasileira e retorna a forma normalizada', () => {
    expect(resolveAircraftRegistration('pt-abc', false)).toEqual({
      normalized: 'PT-ABC',
      error: null,
    });
  });

  it('aceita matrícula alternativa não-P (6 alfanuméricos)', () => {
    expect(resolveAircraftRegistration('AB1234', false)).toEqual({
      normalized: 'AB1234',
      error: null,
    });
  });

  it('rejeita matrícula nacional fora do padrão', () => {
    const result = resolveAircraftRegistration('XYZ', false);
    expect(result.normalized).toBeNull();
    expect(result.error).toBeTruthy();
  });
});

describe('resolveAircraftRegistration (estrangeira)', () => {
  it('aceita 3 a 8 alfanuméricos', () => {
    expect(resolveAircraftRegistration('N12345', true)).toEqual({
      normalized: 'N12345',
      error: null,
    });
  });

  it('rejeita fora da faixa 3–8', () => {
    expect(resolveAircraftRegistration('AB', true).error).toMatch(
      /entre 3 e 8/,
    );
    expect(resolveAircraftRegistration('ABCDEFGHI', true).error).toMatch(
      /entre 3 e 8/,
    );
  });
});
