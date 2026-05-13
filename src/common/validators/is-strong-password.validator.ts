import { Matches, MaxLength, MinLength } from 'class-validator';
import type { ValidationOptions } from 'class-validator';
import { applyDecorators } from '@nestjs/common';

/**
 * Política mínima da Aerobi para senhas humanas (login).
 *
 * Regex exige pelo menos uma letra (qualquer caso) e um dígito. O
 * tamanho é validado separadamente por `@MinLength/@MaxLength` para que
 * o usuário receba mensagens distintas para "muito curta" vs "fraca".
 *
 * Aplicado nos DTOs que carregam senha plain (login, accept-invite,
 * confirm-password-reset). O `ValidationPipe` global rejeita antes do
 * service ser invocado.
 */
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).+$/;

const PASSWORD_MESSAGE =
  'A senha deve ter pelo menos 8 caracteres e conter letras e números.';

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 256;

/**
 * Decorator reusável para campos de senha forte.
 *
 * @example
 * ```ts
 * class AcceptInviteRequestDto {
 *   @IsStrongPassword()
 *   password!: string;
 * }
 * ```
 */
export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return applyDecorators(
    MinLength(MIN_PASSWORD_LENGTH, {
      message: PASSWORD_MESSAGE,
      ...validationOptions,
    }),
    MaxLength(MAX_PASSWORD_LENGTH, {
      message: `A senha não pode exceder ${MAX_PASSWORD_LENGTH} caracteres.`,
      ...validationOptions,
    }),
    Matches(PASSWORD_REGEX, {
      message: PASSWORD_MESSAGE,
      ...validationOptions,
    }),
  );
}
