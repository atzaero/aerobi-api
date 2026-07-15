import { hashRequestIpForRateLimit } from './hash-request-ip.util';

describe('hashRequestIpForRateLimit', () => {
  it('retorna null sem IP', () => {
    expect(hashRequestIpForRateLimit(null)).toBeNull();
    expect(hashRequestIpForRateLimit('')).toBeNull();
  });

  it('retorna hash sha256 estável', () => {
    const a = hashRequestIpForRateLimit('203.0.113.1');
    const b = hashRequestIpForRateLimit('203.0.113.1');
    expect(a).toBe(b);
    expect(a).toMatch(/^[a-f0-9]{64}$/);
  });
});
