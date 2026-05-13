import { Transform } from 'class-transformer';

/**
 * Helpers de `class-transformer` para normalizar strings recebidas em DTOs
 * **antes** das validações do `class-validator` rodarem.
 *
 * Usar nos DTOs (não nos services). Mantém a regra única: validação +
 * normalização do payload são responsabilidade do `ValidationPipe`.
 */

/** Faz `trim()` em string; passa adiante valores não-string sem alterar. */
export const TrimString = () =>
  Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  );

/** Normaliza email: `trim()` + `toLowerCase()`. */
export const NormalizeEmail = () =>
  Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  );
