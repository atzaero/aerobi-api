import { HttpStatus } from '@nestjs/common';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { UserRole } from '@/generated/prisma/client';

/**
 * Escopo por registro (record-level) do ator sobre um recurso escopável por
 * grupo. **Distinto do gate RBAC** (`PermissionsGuard`, papel × ação): aqui
 * respondemos _quais_ registros o ator pode ver/gerir.
 *
 * Espelha `resolveGroupScope` do `aerobi-web`
 * (`app/actions/_shared/group-scope.ts`):
 *  - `all`   — sem restrição de grupo (ADMIN).
 *  - `group` — restrito ao `groupId` do ator (COORDINATOR com grupo).
 *  - `none`  — COORDINATOR sem `groupId` (provisionamento incompleto):
 *              não enxerga/gere nada (nunca "fail open").
 *
 * Restringe **só** COORDINATOR; ADMIN (e qualquer papel fora do conjunto) → `all`.
 * Coerente com entidades cuja matriz só inclui ADMIN/COORDINATOR (ex.: `user`,
 * `group`). Para entidades operacionais o web usa um resolver mais amplo
 * (`resolveOperationalScope`), que não se aplica aqui.
 *
 * Vive em `src/common/` por ser transversal: consumido por `users` e
 * `groups` (e próximos módulos da migração Firebase→API).
 */
export type UserGroupScope =
  | { kind: 'all' }
  | { kind: 'group'; groupId: string }
  | { kind: 'none' };

/**
 * Porta mínima de lookup do ator no DB. O `UserRepository` a satisfaz; manter a
 * interface aqui evita que `@/common` acople ao módulo `users` e centraliza o
 * lambda `(id) => userRepository.findActiveById(id)` antes duplicado em cada
 * consumidor.
 */
export interface ActorGroupLookup {
  findActiveById(id: string): Promise<{ groupId: string | null } | null>;
}

/**
 * Deriva o `UserGroupScope` a partir do papel + grupo do ator. Interno: o ponto
 * de entrada é o `resolveActorGroupScope` (que encapsula o lookup e o
 * short-circuit de ADMIN sem consulta).
 */
function resolveUserGroupScope(
  actorRole: UserRole,
  actorGroupId: string | null,
): UserGroupScope {
  if (actorRole !== UserRole.COORDINATOR) return { kind: 'all' };
  if (!actorGroupId) return { kind: 'none' };
  return { kind: 'group', groupId: actorGroupId };
}

/**
 * Resolve o `UserGroupScope` do ator buscando o grupo no DB **apenas quando
 * necessário**: ADMIN (e papéis não-restritos) curto-circuitam para `all` sem
 * consulta; só COORDINATOR dispara o `lookup` do próprio registro. Centraliza o
 * padrão usado por list/remove/resend (users) e pela list/export de grupos.
 *
 * O ator **não encontrado / inativo** (registro `null` — token ainda válido mas
 * usuário soft-deletado, já que a `JwtStrategy` não revalida contra o DB) é
 * tratado como conta removida (**401 `ACCOUNT_DELETED`**) num único ponto, em
 * vez de virar `none` e mascarar a desativação com resultado vazio. É distinto
 * de um registro existente sem `groupId` (= `none`, COORDINATOR sem
 * grupo provisionado, que legitimamente vê página vazia).
 */
export async function resolveActorGroupScope(
  actorRole: UserRole,
  actorId: string,
  lookup: ActorGroupLookup,
  errorMessageService: ErrorMessageService,
): Promise<UserGroupScope> {
  if (actorRole !== UserRole.COORDINATOR) return { kind: 'all' };

  const record = await lookup.findActiveById(actorId);
  if (record === null) {
    throw new CustomHttpException(
      errorMessageService.getMessage(ErrorCode.ACCOUNT_DELETED),
      HttpStatus.UNAUTHORIZED,
      ErrorCode.ACCOUNT_DELETED,
    );
  }

  return resolveUserGroupScope(actorRole, record.groupId);
}
