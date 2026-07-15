import type { Request } from 'express';

/**
 * Constrói um `Request` do Express **mockado** para specs (controllers, guards e
 * utils que leem `headers`/`ip`). Centraliza o único cast `as unknown as Request`
 * do projeto e cobre os campos usados nos testes: `ip`, o atalho `userAgent`
 * (vira `headers['user-agent']`) e `headers` livres (ex.: `x-forwarded-for`).
 */
export function buildMockRequest(
  overrides: {
    ip?: string;
    userAgent?: string;
    headers?: Record<string, string>;
  } = {},
): Request {
  const headers: Record<string, string> = { ...overrides.headers };
  if (overrides.userAgent !== undefined) {
    headers['user-agent'] = overrides.userAgent;
  }
  return { headers, ip: overrides.ip } as unknown as Request;
}
