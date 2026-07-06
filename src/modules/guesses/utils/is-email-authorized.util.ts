/**
 * Verifica se o e-mail está na lista autorizada (comparação case-insensitive,
 * alinhada a `normalizeAuthorizedEmails` na escrita).
 */
export function isEmailAuthorized(
  email: string,
  authorizedEmails: readonly string[],
): boolean {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return false;
  return authorizedEmails.some(
    (entry) => entry.trim().toLowerCase() === normalized,
  );
}
