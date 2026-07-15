import { Transform } from 'class-transformer';

import {
  normalizeEmailValue,
  normalizeOptionalPhoneE164Value,
  optionalQueryBooleanValue,
  trimOptionalStringValue,
  trimStringValue,
} from './value-transforms';

type TransformArgs = { value: unknown };

/** Campos string obrigatórios: faz `trim()`. */
export function TrimString(): PropertyDecorator {
  return Transform(({ value }: TransformArgs) => trimStringValue(value));
}

/**
 * Campos string opcionais: preserva `undefined` / `null` (semântica
 * PATCH — diferenciar "não enviado" de "string vazia"); trima strings.
 */
export function TrimOptionalString(): PropertyDecorator {
  return Transform(({ value }: TransformArgs) =>
    trimOptionalStringValue(value),
  );
}

/** Email: `trim()` + `toLowerCase()`. */
export function NormalizeEmail(): PropertyDecorator {
  return Transform(({ value }: TransformArgs) => normalizeEmailValue(value));
}

/**
 * Telefone opcional normalizado para E.164: preserva `undefined`/`null`,
 * string vazia vira `null`, demais descartam a máscara e prefixam `+`.
 * Combinar com `@IsOptional()` + `@IsE164Phone()`.
 */
export function NormalizeOptionalPhone(): PropertyDecorator {
  return Transform(({ value }: TransformArgs) =>
    normalizeOptionalPhoneE164Value(value),
  );
}

/**
 * Booleano vindo de query / multipart. Ver `optionalQueryBooleanValue`
 * para o mapeamento exato.
 */
export function OptionalQueryBoolean(): PropertyDecorator {
  return Transform(({ value }: TransformArgs) =>
    optionalQueryBooleanValue(value),
  );
}
