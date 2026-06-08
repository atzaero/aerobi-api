import { registerDecorator } from 'class-validator';
import type { ValidationArguments, ValidationOptions } from 'class-validator';

const YMD_REGEX = /^\d{4}-\d{2}-\d{2}$/;

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
