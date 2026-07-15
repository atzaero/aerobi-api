import { isEmailAuthorized } from './is-email-authorized.util';

describe('isEmailAuthorized', () => {
  it('compara e-mails case-insensitive', () => {
    expect(isEmailAuthorized('A@X.com', ['a@x.com'])).toBe(true);
    expect(isEmailAuthorized('b@x.com', ['a@x.com'])).toBe(false);
  });

  it('faz trim antes de comparar (nos dois lados)', () => {
    expect(isEmailAuthorized(' A@X.com ', ['a@x.com'])).toBe(true);
    expect(isEmailAuthorized('a@x.com', [' a@x.com '])).toBe(true);
  });

  it('e-mail vazio (ou só espaços) nunca é autorizado', () => {
    expect(isEmailAuthorized('', ['a@x.com'])).toBe(false);
    expect(isEmailAuthorized('   ', ['a@x.com'])).toBe(false);
  });

  it('lista vazia nunca autoriza', () => {
    expect(isEmailAuthorized('a@x.com', [])).toBe(false);
  });
});
