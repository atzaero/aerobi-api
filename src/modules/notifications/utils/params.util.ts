/**
 * Leitura defensiva de `params` de notificação.
 *
 * Os `params` chegam ao builder como `Record<string, unknown>` (o dispatch é
 * genérico); estas funções extraem valores com narrowing e fallback, evitando
 * `as` espalhado pelos builders.
 */

/** Lê uma string de `params[key]`, com fallback quando ausente/vazia. */
export function readString(
  params: Readonly<Record<string, unknown>>,
  key: string,
  fallback = '',
): string {
  const value = params[key];
  return typeof value === 'string' && value.length > 0 ? value : fallback;
}

/** Lê um número de `params[key]`, com fallback quando ausente/não-numérico. */
export function readNumber(
  params: Readonly<Record<string, unknown>>,
  key: string,
  fallback = 0,
): number {
  const value = params[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

/** Lê um array de `params[key]`, com fallback para `[]`. */
export function readArray<T = unknown>(
  params: Readonly<Record<string, unknown>>,
  key: string,
): T[] {
  const value = params[key];
  return Array.isArray(value) ? (value as T[]) : [];
}
