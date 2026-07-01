import { Matches } from 'class-validator';
import type { ValidationOptions } from 'class-validator';

/**
 * Coordenada em DMS (graus/minutos/segundos) — espelha `isDmsCoordinate` do
 * `aerobi-web` (`src/lib/coordinates.ts`): `graus°min'seg(.frac)"[NSEW]`, com
 * sinal opcional, graus de largura variável, min/seg de 1-2 dígitos, fração
 * opcional de 1-2 casas e hemisfério `N`/`S`/`E`/`W` (case-insensitive).
 *
 * Exemplos válidos: `03°27'18.50"S`, `041°36'16.91"W`, `41°46'6.06"W`.
 *
 * A string deve chegar já trimada (combinar com `@TrimString()`); aqui só se
 * valida o formato canônico.
 */
export const DMS_COORDINATE_REGEX =
  /^-?\d+°\d{1,2}'\d{1,2}(\.\d{1,2})?"[NSEW]$/i;

/**
 * Decorator reusável para campos de coordenada DMS. Combinar com `@TrimString()`
 * e `@IsNotEmpty()`. A mensagem específica (latitude vs. longitude) é passada por
 * `validationOptions.message`.
 */
export function IsDmsCoordinate(validationOptions?: ValidationOptions) {
  return Matches(DMS_COORDINATE_REGEX, validationOptions);
}
