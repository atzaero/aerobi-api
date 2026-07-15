import { diffAddedEmails } from './diff-added-emails';

describe('diffAddedEmails', () => {
  it('retorna apenas os e-mails presentes em next e ausentes em prev', () => {
    expect(diffAddedEmails(['a@x.com'], ['a@x.com', 'b@x.com'])).toEqual([
      'b@x.com',
    ]);
  });

  it('compara case-insensitive com trim (não considera adicionado)', () => {
    expect(diffAddedEmails(['A@x.com'], [' a@x.com '])).toEqual([]);
  });

  it('preserva a grafia de next (com trim) no retorno', () => {
    expect(diffAddedEmails([], [' New@X.com '])).toEqual(['New@X.com']);
  });

  it('deduplica entradas repetidas de next', () => {
    expect(diffAddedEmails([], ['b@x.com', 'B@x.com'])).toEqual(['b@x.com']);
  });

  it('descarta strings vazias', () => {
    expect(diffAddedEmails([], ['', '   ', 'c@x.com'])).toEqual(['c@x.com']);
  });

  it('com prev vazio retorna todos os e-mails únicos de next', () => {
    expect(diffAddedEmails([], ['a@x.com', 'b@x.com'])).toEqual([
      'a@x.com',
      'b@x.com',
    ]);
  });
});
