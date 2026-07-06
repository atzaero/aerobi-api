import { isEmailAuthorized } from './is-email-authorized.util';

describe('isEmailAuthorized', () => {
  it('compara e-mails case-insensitive', () => {
    expect(isEmailAuthorized('A@X.com', ['a@x.com'])).toBe(true);
    expect(isEmailAuthorized('b@x.com', ['a@x.com'])).toBe(false);
  });
});
