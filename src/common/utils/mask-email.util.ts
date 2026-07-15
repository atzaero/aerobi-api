/**
 * Mascara um email para reduzir PII em logs.
 *
 * - `ana@example.com` → `an***@example.com`
 * - inputs malformados (sem `@`, ou sem local/domínio) → `***`
 *
 * Usar nos logs de `AuthLoginService`, `RequestPasswordResetService`,
 * `AcceptInviteService`, etc — onde o email é apenas instrumentação.
 */
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain || !local) {
    return '***';
  }
  const visible = local.slice(0, 2);
  return `${visible}***@${domain}`;
}
