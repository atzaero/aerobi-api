import { Transform } from 'class-transformer';

/**
 * Apara strings opcionais; `''` após trim vira `null` — paridade com o Zod do
 * web (`optionalTrimmed` em `visit-form-action-schema.ts`).
 */
export function TrimToNull() {
  return Transform(({ value }: { value: unknown }) => {
    if (value === undefined) return undefined;
    if (value === null) return null;
    if (typeof value !== 'string') return value;
    const trimmed = value.trim();
    return trimmed === '' ? null : trimmed;
  });
}

/**
 * Apara strings obrigatórias; rejeita vazio via `@IsNotEmpty()` após trim.
 */
export function TrimString() {
  return Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  );
}
