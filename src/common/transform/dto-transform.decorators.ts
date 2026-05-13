import { Transform } from 'class-transformer';

import {
  normalizeEmailValue,
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
 * Booleano vindo de query / multipart. Ver `optionalQueryBooleanValue`
 * para o mapeamento exato.
 */
export function OptionalQueryBoolean(): PropertyDecorator {
  return Transform(({ value }: TransformArgs) =>
    optionalQueryBooleanValue(value),
  );
}
