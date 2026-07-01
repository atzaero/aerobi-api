import { registerDecorator } from 'class-validator';
import type { ValidationArguments, ValidationOptions } from 'class-validator';

const YMD_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Extrai o valor de outra propriedade do objeto sob validação sem recorrer a
 * `any` (o `object` do class-validator é tipado como `object`).
 */
function siblingValue(object: object, property: string): unknown {
  return (object as Record<string, unknown>)[property];
}

/**
 * `true` se `value` é uma data de **calendário real** no formato `YYYY-MM-DD`.
 *
 * Vai além do regex: rejeita datas impossíveis que passam no formato mas não
 * existem (ex. `2026-13-45`, `2026-02-31`) — estas, se aceitas, virariam
 * `Invalid Date` (→ 500 no Prisma) ou seriam coercidas silenciosamente para
 * outro dia (range de filtro errado).
 */
export function isValidYmdDate(value: unknown): value is string {
  if (typeof value !== 'string' || !YMD_REGEX.test(value)) {
    return false;
  }
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

/**
 * Decorator reusável para campos de data no formato `YYYY-MM-DD` que precisam
 * ser datas de calendário válidas. Rejeitado pelo `ValidationPipe` global (400)
 * antes do service.
 */
export function IsYmdDate(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      name: 'isYmdDate',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate: (value: unknown): boolean => isValidYmdDate(value),
        defaultMessage: (args: ValidationArguments): string =>
          `${args.property} deve ser uma data válida no formato YYYY-MM-DD`,
      },
    });
  };
}

/**
 * Decorator cross-field: garante que este campo (`YYYY-MM-DD`) é **maior ou
 * igual** ao campo `property` do mesmo DTO (ex.: `endDate >= startDate`). Usa
 * comparação lexicográfica — válida para `YYYY-MM-DD` (zero-padded).
 *
 * Só compara quando **ambos** os campos são datas YMD válidas; deixa o formato
 * inválido/ausente para o `@IsYmdDate`/`@IsOptional` de cada campo (evita erro
 * duplicado). Rejeitado pelo `ValidationPipe` global (400) antes do service.
 */
export function IsYmdDateOnOrAfter(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      name: 'isYmdDateOnOrAfter',
      target: object.constructor,
      propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate: (value: unknown, args: ValidationArguments): boolean => {
          const [relatedProperty] = args.constraints as [string];
          const related = siblingValue(args.object, relatedProperty);
          if (!isValidYmdDate(value) || !isValidYmdDate(related)) {
            return true;
          }
          return value >= related;
        },
        defaultMessage: (args: ValidationArguments): string => {
          const [relatedProperty] = args.constraints as [string];
          return `${args.property} deve ser maior ou igual a ${relatedProperty}`;
        },
      },
    });
  };
}
