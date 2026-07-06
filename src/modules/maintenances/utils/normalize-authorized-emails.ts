/**
 * Normaliza a lista de e-mails autorizados: trim, deduplicação case-insensitive
 * (preserva a grafia da primeira ocorrência) e descarta strings vazias.
 */
export function normalizeAuthorizedEmails(emails: readonly string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of emails) {
    const email = raw.trim();
    if (!email) continue;
    const key = email.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(email);
  }
  return out;
}
