import { createHash } from 'node:crypto';

/**
 * Hash irreversível do IP para rate limit de formulários públicos (não armazena
 * IP em claro). Espelha `aerobi-web` `hashRequestIpForRateLimit`.
 */
export function hashRequestIpForRateLimit(
  ipAddress: string | null | undefined,
): string | null {
  const trimmed = ipAddress?.trim();
  if (!trimmed) {
    return null;
  }
  return createHash('sha256').update(`contact-rate:${trimmed}`).digest('hex');
}
