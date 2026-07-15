import type { Request } from 'express';

import { extractIpAddress } from './extract-ip-address.util';

function buildRequest(overrides: {
  headers?: Record<string, string | string[] | undefined>;
  ip?: string;
}): Request {
  return {
    headers: overrides.headers ?? {},
    ip: overrides.ip,
  } as unknown as Request;
}

describe('extractIpAddress', () => {
  it('retorna request.ip (resolvido pelo Express com trust proxy)', () => {
    const req = buildRequest({ ip: '203.0.113.1' });
    expect(extractIpAddress(req)).toBe('203.0.113.1');
  });

  it('ignora o X-Forwarded-For cru — não é falsificável via header', () => {
    const req = buildRequest({
      headers: { 'x-forwarded-for': '1.2.3.4' },
      ip: '203.0.113.1',
    });
    expect(extractIpAddress(req)).toBe('203.0.113.1');
  });

  it('retorna undefined quando request.ip não está presente', () => {
    const req = buildRequest({});
    expect(extractIpAddress(req)).toBeUndefined();
  });
});
