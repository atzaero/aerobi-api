import { normalizeAuthorizedEmails } from './normalize-authorized-emails';

describe('normalizeAuthorizedEmails', () => {
  it('aplica trim a cada e-mail', () => {
    expect(normalizeAuthorizedEmails(['  a@x.com  '])).toEqual(['a@x.com']);
  });

  it('deduplica case-insensitive preservando a primeira grafia', () => {
    expect(
      normalizeAuthorizedEmails(['A@x.com', 'a@x.com', ' B@x.com ']),
    ).toEqual(['A@x.com', 'B@x.com']);
  });

  it('descarta strings vazias ou só com espaços', () => {
    expect(normalizeAuthorizedEmails(['', '   ', 'c@x.com'])).toEqual([
      'c@x.com',
    ]);
  });

  it('retorna lista vazia para entrada vazia', () => {
    expect(normalizeAuthorizedEmails([])).toEqual([]);
  });
});
