/**
 * Leitura e validação das variáveis de ambiente dos seeds. Falha cedo, com
 * mensagens prefixadas, para que uma configuração inválida não chegue ao banco.
 */

/** Comprimento mínimo de senha (espelha o validador do seed antigo). */
export const MIN_PASSWORD_LENGTH = 8;

/**
 * Lê uma senha obrigatória, validando o comprimento mínimo. Lança se ausente ou
 * curta demais — usado para `SEED_ADMIN_PASSWORD` e `SEED_DEFAULT_PASSWORD`.
 */
export function requirePassword(env: NodeJS.ProcessEnv, key: string): string {
  const value = env[key];
  if (!value) {
    throw new Error(`[seeds] ${key} ausente no ambiente.`);
  }
  if (value.length < MIN_PASSWORD_LENGTH) {
    throw new Error(
      `[seeds] ${key} tem menos de ${MIN_PASSWORD_LENGTH} caracteres.`,
    );
  }
  return value;
}

/** Lê uma string opcional (trim); retorna `fallback` quando ausente/vazia. */
export function optionalString(
  env: NodeJS.ProcessEnv,
  key: string,
  fallback: string,
): string {
  const value = env[key]?.trim();
  return value && value.length > 0 ? value : fallback;
}

/**
 * Lê uma contagem inteira `>= 0` (default `fallback`). Rejeita NaN, decimais e
 * negativos — `0` é válido e significa "não criar essa função neste estado".
 */
export function parseCount(
  env: NodeJS.ProcessEnv,
  key: string,
  fallback = 1,
): number {
  const raw = env[key]?.trim();
  if (!raw) {
    return fallback;
  }
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(
      `[seeds] ${key} inválido: "${raw}". Esperado inteiro >= 0.`,
    );
  }
  return value;
}

/**
 * Normaliza o domínio de email (trim, lowercase, sem `@` à esquerda). Default
 * `aerobi.com.br`.
 */
export function parseEmailDomain(
  env: NodeJS.ProcessEnv,
  key: string,
  fallback = 'aerobi.com.br',
): string {
  const raw = env[key]?.trim().toLowerCase().replace(/^@+/, '');
  return raw && raw.length > 0 ? raw : fallback;
}
