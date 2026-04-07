/**
 * Normaliza nós XML repetíveis: um único elemento vira array de um elemento.
 */
export function ensureArray<T>(value: T | T[] | undefined | null): T[] {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}
