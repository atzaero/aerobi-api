import {
  registerDecorator,
  type ValidationArguments,
  type ValidationOptions,
} from 'class-validator';

/**
 * Valida que um `Date` não está no futuro — paridade com `isVisitDateInFuture`
 * do `aerobi-web` (`visit-form-action-schema`).
 */
export function IsNotFutureDate(validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'isNotFutureDate',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
            return false;
          }
          return value.getTime() <= Date.now();
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} não pode ser no futuro`;
        },
      },
    });
  };
}
