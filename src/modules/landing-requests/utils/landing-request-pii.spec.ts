import { maskPilotCpf } from './landing-request-pii';

describe('maskPilotCpf', () => {
  it('mascara os 11 dígitos revelando só os 6 primeiros', () => {
    expect(maskPilotCpf('12345678909')).toBe('123.456.***-**');
  });

  it('aceita CPF já com máscara (só considera os dígitos)', () => {
    expect(maskPilotCpf('123.456.789-09')).toBe('123.456.***-**');
  });

  it('menos de 6 dígitos: oculta o segundo grupo', () => {
    expect(maskPilotCpf('12345')).toBe('123.***.***-**');
  });

  it('menos de 3 dígitos: oculta tudo', () => {
    expect(maskPilotCpf('12')).toBe('***.***.***-**');
  });

  it('null/vazio → null', () => {
    expect(maskPilotCpf(null)).toBeNull();
    expect(maskPilotCpf(undefined)).toBeNull();
    expect(maskPilotCpf('')).toBeNull();
  });
});
