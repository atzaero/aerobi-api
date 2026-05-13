import { HttpStatus } from '@nestjs/common';
import bcrypt from 'bcryptjs';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';

/** Cost factor para bcrypt (2026): rápido para rotas síncronas, robusto contra brute force. */
const BCRYPT_COST = 12;

/** Política mínima: 8+ chars, letras e números. */
const MIN_LENGTH = 8;
const HAS_LETTER = /[a-zA-Z]/;
const HAS_DIGIT = /[0-9]/;

/**
 * Valida a força mínima da senha. Lança `CustomHttpException` com
 * `WEAK_PASSWORD` quando a senha não atende à política.
 *
 * Usado por `AcceptInviteService` e `ConfirmPasswordResetService`.
 */
export function assertPasswordPolicy(
  password: string,
  errorMessageService: ErrorMessageService,
): void {
  const passes =
    password.length >= MIN_LENGTH &&
    HAS_LETTER.test(password) &&
    HAS_DIGIT.test(password);

  if (!passes) {
    throw new CustomHttpException(
      errorMessageService.getMessage(ErrorCode.WEAK_PASSWORD),
      HttpStatus.BAD_REQUEST,
      ErrorCode.WEAK_PASSWORD,
    );
  }
}

/** Gera o hash bcrypt da senha plain (cost 12). */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_COST);
}

/** Compara senha plain com hash bcrypt armazenado. */
export async function comparePassword(
  plain: string,
  hashed: string,
): Promise<boolean> {
  return bcrypt.compare(plain, hashed);
}
