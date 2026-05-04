/**
 * Extrai texto de CDATA ou valor direto (parse fast-xml-parser v5).
 * fast-xml-parser v5 envolve CDATA em array: [{"#text":"valor"}].
 */
export function unwrapCdata(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) {
    return value.length > 0 ? unwrapCdata(value[0]) : '';
  }
  if (typeof value === 'object' && value !== null && '#text' in value) {
    return unwrapCdata((value as { '#text'?: unknown })['#text']);
  }
  if (typeof value === 'object') return '';
  return String(value);
}
