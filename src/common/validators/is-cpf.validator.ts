import { registerDecorator } from 'class-validator';
import type { ValidationOptions } from 'class-validator';

const CPF_MESSAGE = 'Informe um CPF válido (11 dígitos).';

/**
 * `true` se `value` é um CPF válido em **11 dígitos crus** (sem máscara):
 * confere os dois dígitos verificadores e rejeita as sequências repetidas
 * (`00000000000`, `11111111111`, …) que passam no cálculo mas são inválidas.
 * Espelha `isValidCpfDigits` do `aerobi-web` (`lib/zod-refine-predicates.ts`).
 *
 * A remoção da máscara fica no transform do DTO (`@StripToCpfDigits`); aqui só
 * validamos os 11 dígitos já normalizados.
 */
export function isValidCpfDigits(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{11}$/.test(value)) {
    return false;
  }
  if (/^(\d)\1{10}$/.test(value)) {
    return false;
  }

  const digits = value.split('').map(Number);
  const checkDigit = (length: number): number => {
    let sum = 0;
    for (let i = 0; i < length; i += 1) {
      sum += digits[i] * (length + 1 - i);
    }
    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };

  return checkDigit(9) === digits[9] && checkDigit(10) === digits[10];
}

/**
 * Decorator reusável para campos de CPF (11 dígitos crus). Combinar com um
 * transform que remova a máscara antes da validação. Rejeitado pelo
 * `ValidationPipe` global (400) antes do service.
 */
export function IsCpf(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      name: 'isCpf',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate: (value: unknown): boolean => isValidCpfDigits(value),
        defaultMessage: (): string => CPF_MESSAGE,
      },
    });
  };
}
