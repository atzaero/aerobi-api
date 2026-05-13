import { maskEmail } from './mask-email.util';

describe('maskEmail', () => {
  it('mostra os 2 primeiros chars do local + mask + domínio', () => {
    expect(maskEmail('ana@example.com')).toBe('an***@example.com');
  });

  it('retorna placeholder para email malformado', () => {
    expect(maskEmail('not-an-email')).toBe('***');
    expect(maskEmail('@')).toBe('***');
    expect(maskEmail('single')).toBe('***');
    expect(maskEmail('')).toBe('***');
  });

  it('preserva o domínio integralmente', () => {
    expect(maskEmail('admin@aerobi.local')).toBe('ad***@aerobi.local');
  });

  it('lida com locais curtos (1 char)', () => {
    expect(maskEmail('a@x.com')).toBe('a***@x.com');
  });
});
