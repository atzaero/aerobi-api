import { isValidCpfDigits } from './is-cpf.validator';

describe('isValidCpfDigits', () => {
  it('aceita CPF válido em 11 dígitos crus', () => {
    expect(isValidCpfDigits('12345678909')).toBe(true);
  });

  it('rejeita dígito verificador incorreto', () => {
    expect(isValidCpfDigits('12345678900')).toBe(false);
  });

  it('rejeita sequência repetida (00000000000, 11111111111, …)', () => {
    expect(isValidCpfDigits('00000000000')).toBe(false);
    expect(isValidCpfDigits('11111111111')).toBe(false);
  });

  it('rejeita comprimento diferente de 11 ou com não-dígitos', () => {
    expect(isValidCpfDigits('123')).toBe(false);
    expect(isValidCpfDigits('123.456.789-09')).toBe(false);
    expect(isValidCpfDigits('')).toBe(false);
  });

  it('rejeita valores não-string', () => {
    expect(isValidCpfDigits(12345678909)).toBe(false);
    expect(isValidCpfDigits(null)).toBe(false);
  });
});
