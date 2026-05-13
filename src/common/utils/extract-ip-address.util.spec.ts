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
  it('retorna o primeiro IP de X-Forwarded-For quando presente', () => {
    const req = buildRequest({
      headers: { 'x-forwarded-for': '203.0.113.1, 10.0.0.1, 192.168.0.1' },
      ip: '127.0.0.1',
    });
    expect(extractIpAddress(req)).toBe('203.0.113.1');
  });

  it('faz trim de espaços no IP retornado', () => {
    const req = buildRequest({
      headers: { 'x-forwarded-for': '  203.0.113.1  , 10.0.0.1' },
    });
    expect(extractIpAddress(req)).toBe('203.0.113.1');
  });

  it('cai para request.ip quando o header está ausente', () => {
    const req = buildRequest({ ip: '198.51.100.7' });
    expect(extractIpAddress(req)).toBe('198.51.100.7');
  });

  it('cai para request.ip quando o header é array (não string)', () => {
    const req = buildRequest({
      headers: { 'x-forwarded-for': ['203.0.113.1'] },
      ip: '198.51.100.7',
    });
    expect(extractIpAddress(req)).toBe('198.51.100.7');
  });

  it('cai para request.ip quando o header é string vazia', () => {
    const req = buildRequest({
      headers: { 'x-forwarded-for': '' },
      ip: '198.51.100.7',
    });
    expect(extractIpAddress(req)).toBe('198.51.100.7');
  });

  it('retorna undefined quando nem header nem request.ip estão presentes', () => {
    const req = buildRequest({});
    expect(extractIpAddress(req)).toBeUndefined();
  });
});
