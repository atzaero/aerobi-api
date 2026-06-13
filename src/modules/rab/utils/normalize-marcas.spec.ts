import { normalizeMarcas } from './normalize-marcas';

describe('normalizeMarcas', () => {
  it('remove o hífen', () => {
    expect(normalizeMarcas('PT-KOB')).toBe('PTKOB');
  });

  it('remove espaços', () => {
    expect(normalizeMarcas('PT KOB')).toBe('PTKOB');
  });

  it('converte para maiúsculas', () => {
    expect(normalizeMarcas('pt-kob')).toBe('PTKOB');
  });

  it('mantém uma matrícula já canônica', () => {
    expect(normalizeMarcas('PTKOB')).toBe('PTKOB');
  });

  it('combina hífen, espaços e caixa', () => {
    expect(normalizeMarcas(' pt - kob ')).toBe('PTKOB');
  });

  it('retorna string vazia para entrada vazia', () => {
    expect(normalizeMarcas('')).toBe('');
  });
});
