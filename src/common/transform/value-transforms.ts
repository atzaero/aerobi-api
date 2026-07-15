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
 * Normaliza telefone opcional para E.164 (espelha `normalizeToE164` do
 * `aerobi-web`): preserva `undefined`/`null` (semântica PATCH); string vazia
 * (após trim) vira `null`; senão descarta a máscara e prefixa `+` aos dígitos.
 * Quando a string não tem dígito algum, devolve o valor trimado original para
 * que `@IsE164Phone` rejeite com a mensagem correta em vez de mascarar o erro.
 *
 * A entrada **deve incluir o código do país (DDI)**: a normalização não o
 * infere — uma máscara BR sem `+55` resultaria num E.164 com DDI incorreto
 * (ex.: `(11) 99999-9999` → `+11999999999`). O frontend deve enviar com DDI.
 */
export function normalizeOptionalPhoneE164Value(value: unknown): unknown {
  if (value === undefined || value === null) {
    return value;
  }
  if (typeof value !== 'string') {
    return value;
  }
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return null;
  }
  const digits = trimmed.replace(/\D/g, '');
  return digits.length > 0 ? `+${digits}` : trimmed;
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
