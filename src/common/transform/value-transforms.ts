/**
 * Helpers puros para `class-transformer`. Trabalham com `unknown` (o input
 * de `Transform` não é tipado pelo class-validator) e são fáceis de testar
 * sem precisar de `plainToInstance`.
 *
 * As versões decoradas vivem em `./dto-transform.decorators.ts`.
 */

/** `trim()` em string; passa adiante valores não-string sem alterar. */
export function trimStringValue(value: unknown): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

/**
 * Preserva `undefined` / `null` (semântica PATCH — diferenciar "campo
 * ausente" de "campo presente e vazio"); trima strings; passa outros
 * tipos adiante.
 */
export function trimOptionalStringValue(value: unknown): unknown {
  if (value === undefined || value === null) {
    return value;
  }
  return typeof value === 'string' ? value.trim() : value;
}

/** Normaliza email: `trim()` + `toLowerCase()` quando for string. */
export function normalizeEmailValue(value: unknown): unknown {
  return typeof value === 'string' ? value.trim().toLowerCase() : value;
}

/**
 * Booleano vindo de query string ou multipart:
 *  - ausente / vazio / null → `undefined`
 *  - `true` / `'true'`     → `true`
 *  - qualquer outro valor   → `false`
 *
 * Útil em DTOs de query para filtros opcionais (`?active=true`).
 */
export function optionalQueryBooleanValue(value: unknown): unknown {
  if (value === undefined || value === '' || value === null) {
    return undefined;
  }
  return value === true || value === 'true';
}
