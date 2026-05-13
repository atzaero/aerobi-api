import type { Request } from 'express';

/**
 * Extrai o IP de origem de um `Request` Express, priorizando o cabeçalho
 * `X-Forwarded-For` (primeiro valor da cadeia) e caindo para `request.ip`
 * — que reflete o socket diretamente conectado ao Node.
 *
 * **Atenção**: `X-Forwarded-For` é spoofável quando a aplicação não está
 * atrás de um proxy confiável (nginx/cloudfront). Em produção, garantir
 * `app.set('trust proxy', ...)` com a topologia correta antes de usar
 * o IP retornado para decisões de segurança (rate-limit, audit).
 *
 * Retorna `undefined` quando nenhum dos dois está presente — caller
 * decide o fallback (`'unknown'`, `null`, etc.).
 */
export function extractIpAddress(request: Request): string | undefined {
  const forwarded = request.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0]?.trim();
  }
  return request.ip;
}
