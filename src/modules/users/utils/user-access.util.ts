import { HttpStatus } from '@nestjs/common';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { httpError } from '@/common/exceptions/http-error.util';
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

  throw httpError(
    errorMessageService,
    ErrorCode.OWNERSHIP_VIOLATION,
    HttpStatus.FORBIDDEN,
  );
}

/**
 * Recorte por **role-alvo** na gestão de usuários (regra de negócio, não a
 * matriz `PERMISSIONS`): ADMIN gere qualquer role; COORDINATOR só cria
 * `OPERATOR`/`TECHNICAL`. Qualquer outro caso → 403.
 *
 * Usado no **create**. Em `remove`/`resend` o recorte por role-alvo é absorvido
 * pelo **escopo por grupo** (`resolveUserGroupScope` + `isTargetManageableInGroup`
 * em `group-scope.util`), que combina role-alvo + próprio grupo e responde
 * `USER_NOT_FOUND` (não vaza a existência de alvos fora do escopo).
 *
 * O gate papel × ação (quem chega à rota) é do `PermissionsGuard`; este recorte
 * é o passo seguinte — _quais_ usuários o ator pode tocar.
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

  throw httpError(
    errorMessageService,
    ErrorCode.FORBIDDEN,
    HttpStatus.FORBIDDEN,
    {
      RESOURCE: 'user',
    },
  );
}

/**
 * Recorte por **role atribuível** na edição administrativa: qual role o ator
 * pode **definir** no alvo. ADMIN atribui qualquer role; COORDINATOR atribui
 * `OPERATOR`/`TECHNICAL`/`COORDINATOR` mas **nunca promove a ADMIN** (espelha
 * `getAssignableRolesForEdit` do `aerobi-web`). Violação ⇒ `ROLE_CHANGE_FORBIDDEN`.
 */
export function assertCanAssignRole(
  actorRole: UserRole,
  targetRole: UserRole,
  errorMessageService: ErrorMessageService,
): void {
  if (actorRole === UserRole.ADMIN) return;
  if (actorRole === UserRole.COORDINATOR && targetRole !== UserRole.ADMIN) {
    return;
  }

  throw httpError(
    errorMessageService,
    ErrorCode.ROLE_CHANGE_FORBIDDEN,
    HttpStatus.FORBIDDEN,
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

  throw httpError(errorMessageService, errorCode, HttpStatus.FORBIDDEN);
}
