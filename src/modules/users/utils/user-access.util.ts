import { HttpStatus } from '@nestjs/common';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { UserRole } from '@/generated/prisma/client';

import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

/**
 * Garante que o `actor` é o próprio dono do recurso (`targetUserId`)
 * OU é ADMIN. Caso contrário, lança `OWNERSHIP_VIOLATION` (403).
 *
 * Usado por endpoints `GET /users/:id`, `PATCH /users/:id` (a versão
 * permissiva — ADMIN pode tudo, owner pode subset dos campos).
 */
export function assertSelfOrAdmin(
  actor: AuthenticatedUser,
  targetUserId: string,
  errorMessageService: ErrorMessageService,
): void {
  if (actor.role === UserRole.ADMIN) return;
  if (actor.id === targetUserId) return;

  throw new CustomHttpException(
    errorMessageService.getMessage(ErrorCode.OWNERSHIP_VIOLATION),
    HttpStatus.FORBIDDEN,
    ErrorCode.OWNERSHIP_VIOLATION,
  );
}

/**
 * Garante que `actor` é ADMIN. Usado quando a regra é estritamente
 * "só ADMIN" (não permite owner) — ex: alterar role de outro user.
 */
export function assertAdmin(
  actor: AuthenticatedUser,
  errorMessageService: ErrorMessageService,
  errorCode: ErrorCode = ErrorCode.FORBIDDEN,
): void {
  if (actor.role === UserRole.ADMIN) return;

  throw new CustomHttpException(
    errorMessageService.getMessage(errorCode),
    HttpStatus.FORBIDDEN,
    errorCode,
  );
}
