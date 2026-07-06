/**
 * `@Transform` de trim de string (mantém não-strings intactas). Tipado como
 * `unknown` para satisfazer `no-unsafe-return` — mesmo padrão dos DTOs de
 * `landing-requests`.
 */
export const trimString = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;
