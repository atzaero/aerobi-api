import { Matches } from 'class-validator';
import type { ValidationOptions } from 'class-validator';

/**
 * Formato E.164 para telefones (espelha `aerobi-web/src/lib/phone-e164.ts`):
 * `+` seguido de um dígito 1-9 e mais 7 a 14 dígitos (8 a 15 dígitos no total).
 *
 * A normalização do input (remover máscara, prefixar `+`, vazio → `null`)
 * fica no transform `@NormalizeOptionalPhone`, aplicado antes da validação;
 * aqui só validamos o formato canônico já normalizado.
 */
const E164_REGEX = /^\+[1-9]\d{7,14}$/;

const E164_MESSAGE =
  'Use o telefone com código do país e DDD, por exemplo +55 11 99999-9999.';

/**
 * Decorator reusável para campos de telefone em E.164. Combinar com
 * `@IsOptional()` + `@NormalizeOptionalPhone()` quando o campo for opcional.
 *
 * @example
 * ```ts
 * class Dto {
 *   @IsOptional()
 *   @NormalizeOptionalPhone()
 *   @IsE164Phone()
 *   @MaxLength(32)
 *   phone?: string | null;
 * }
 * ```
 */
export function IsE164Phone(validationOptions?: ValidationOptions) {
  return Matches(E164_REGEX, { message: E164_MESSAGE, ...validationOptions });
}
