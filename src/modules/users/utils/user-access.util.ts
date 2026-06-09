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
 * Recorte por **role-alvo** na gestão de usuários (regra de negócio, não a
 * matriz `PERMISSIONS`). Espelha célula a célula o `aerobi-web`
 * (`app/actions/users/{create,delete}`): ADMIN gere qualquer role; COORDINATOR
 * só adiciona/remove `OPERATOR`/`TECHNICAL`. Qualquer outro caso → 403.
 *
 * O gate papel × ação (quem chega à rota) é do `PermissionsGuard`; este recorte
 * é o passo seguinte — _quais_ usuários o ator pode tocar. O **escopo por grupo**
 * (coordinator restrito ao próprio `aerodromeGroupId`) é a epic #204 e **não**
 * entra aqui.
 *
 * @param actorRole papel do ator autenticado (`@CurrentUser().role`)
 * @param targetRole papel do usuário-alvo (a criar, ou do registro carregado)
 */
export function assertCanManageTargetRole(
  actorRole: UserRole,
  targetRole: UserRole,
  errorMessageService: ErrorMessageService,
): void {
  if (actorRole === UserRole.ADMIN) return;
  if (
    actorRole === UserRole.COORDINATOR &&
    (targetRole === UserRole.OPERATOR || targetRole === UserRole.TECHNICAL)
  ) {
    return;
  }

  throw new CustomHttpException(
    errorMessageService.getMessage(ErrorCode.FORBIDDEN, { RESOURCE: 'user' }),
    HttpStatus.FORBIDDEN,
    ErrorCode.FORBIDDEN,
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
