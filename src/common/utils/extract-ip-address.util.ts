import type { Request } from 'express';

/**
 * IP de origem do request para decisões de segurança (rate-limit, auditoria).
 *
 * Usa `request.ip`, que depende de `trust proxy` estar configurado no bootstrap
 * (ver `applyTrustProxy`): com um proxy confiável à frente, o Express resolve o
 * IP real do cliente a partir do `X-Forwarded-For` adicionado pelo proxy e
 * ignora o header quando forjado por um cliente conectado diretamente. **Não**
 * ler o `X-Forwarded-For` cru — é falsificável.
 *
 * Retorna `undefined` quando o Express não conseguiu resolver o IP — o caller
 * decide o fallback (`'unknown'`, `null`, etc.).
 */
export function extractIpAddress(request: Request): string | undefined {
  return request.ip;
}
