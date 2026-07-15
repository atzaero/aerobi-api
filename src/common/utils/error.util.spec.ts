import { getErrorMessage } from './error.util';

describe('getErrorMessage', () => {
  it('retorna a message quando o valor é uma Error', () => {
    expect(getErrorMessage(new Error('falhou'))).toBe('falhou');
  });

  it('preserva a message em subclasses de Error', () => {
    expect(getErrorMessage(new TypeError('tipo inválido'))).toBe(
      'tipo inválido',
    );
  });

  it('coage valores não-Error com String()', () => {
    expect(getErrorMessage('erro em string')).toBe('erro em string');
    expect(getErrorMessage(42)).toBe('42');
    expect(getErrorMessage(null)).toBe('null');
    expect(getErrorMessage(undefined)).toBe('undefined');
  });

  it('serializa objetos lançados via String()', () => {
    expect(getErrorMessage({ foo: 'bar' })).toBe('[object Object]');
  });

  it('respeita toString() customizado de objetos não-Error', () => {
    expect(getErrorMessage({ toString: () => 'erro customizado' })).toBe(
      'erro customizado',
    );
  });
});
