/**
 * Dia UTC (`YYYY-MM-DD`) usado como chave de rate-limit diário — espelha
 * `aerobi-web` `_shared/contact-date.ts`.
 */
export function resolveContactDate(now: Date = new Date()): string {
  const [datePart] = now.toISOString().split('T');
  return datePart ?? '';
}
