import { hashRefreshToken } from './refresh-token-hash.util';

describe('hashRefreshToken', () => {
  it('produz hex SHA-256 de 64 chars', () => {
    expect(hashRefreshToken('any-input')).toMatch(/^[a-f0-9]{64}$/);
  });

  it('é determinístico (mesmo input → mesmo hash)', () => {
    expect(hashRefreshToken('jwt-plain-value')).toBe(
      hashRefreshToken('jwt-plain-value'),
    );
  });

  it('produz hashes distintos para inputs distintos', () => {
    expect(hashRefreshToken('a')).not.toBe(hashRefreshToken('b'));
  });
});
