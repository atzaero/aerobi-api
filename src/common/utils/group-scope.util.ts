import { HttpStatus } from '@nestjs/common';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { resourceNotFound } from '@/common/utils/resource-not-found.util';
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
 * Restringe os papéis do conjunto configurado; ADMIN (e qualquer papel fora
 * dele) → `all`. Duas entradas públicas partilham o núcleo:
 *  - `resolveActorGroupScope` — recursos **administrativos** (só COORDINATOR;
 *    matriz ADMIN/COORDINATOR, ex.: `user`, `group`).
 *  - `resolveOperationalActorScope` — recursos **operacionais** (COORDINATOR +
 *    OPERATOR + TECHNICAL; espelha `resolveOperationalScope` do web, ex.:
 *    `aerodrome` e os módulos pendurados nele).
 *
 * Vive em `src/common/` por ser transversal: consumido por `users`, `groups`,
 * `aerodromes` (e próximos módulos da migração Firebase→API).
 */
export type UserGroupScope =
  { kind: 'all' } | { kind: 'group'; groupId: string } | { kind: 'none' };

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
 * Papéis restritos ao próprio grupo em recursos **administrativos** (users,
 * groups): só COORDINATOR. ADMIN é global.
 */
const GROUP_SCOPED_ROLES: readonly UserRole[] = [UserRole.COORDINATOR];

/**
 * Papéis restritos ao próprio grupo em recursos **operacionais** (aeródromos e
 * módulos pendurados neles): COORDINATOR + OPERATOR + TECHNICAL — espelha
 * `resolveOperationalScope` do `aerobi-web`. ADMIN continua global.
 */
const OPERATIONAL_SCOPED_ROLES: readonly UserRole[] = [
  UserRole.COORDINATOR,
  UserRole.OPERATOR,
  UserRole.TECHNICAL,
];

/**
 * Projeta o `groupId` do ator num `UserGroupScope` já sabendo que o papel é
 * restrito: sem grupo provisionado → `none` (vê página vazia, nunca "fail
 * open"); com grupo → `group`.
 */
function scopeFromActorGroupId(actorGroupId: string | null): UserGroupScope {
  if (!actorGroupId) return { kind: 'none' };
  return { kind: 'group', groupId: actorGroupId };
}

/**
 * Núcleo compartilhado: resolve o `UserGroupScope` do ator buscando o grupo no
 * DB **apenas quando necessário**. Papéis fora de `scopedRoles` (sempre ADMIN, e
 * — no caso administrativo — também OPERATOR/TECHNICAL) curto-circuitam para
 * `all` sem consulta; só os papéis restritos disparam o `lookup`.
 *
 * O ator **não encontrado / inativo** (registro `null` — token ainda válido mas
 * usuário soft-deletado, já que a `JwtStrategy` não revalida contra o DB) é
 * tratado como conta removida (**401 `ACCOUNT_DELETED`**) num único ponto, em
 * vez de virar `none` e mascarar a desativação com resultado vazio. É distinto
 * de um registro existente sem `groupId` (= `none`, papel restrito sem grupo
 * provisionado, que legitimamente vê página vazia).
 */
async function resolveScopeForRoles(
  actorRole: UserRole,
  actorId: string,
  lookup: ActorGroupLookup,
  errorMessageService: ErrorMessageService,
  scopedRoles: readonly UserRole[],
): Promise<UserGroupScope> {
  if (!scopedRoles.includes(actorRole)) return { kind: 'all' };

  const record = await lookup.findActiveById(actorId);
  if (record === null) {
    throw new CustomHttpException(
      errorMessageService.getMessage(ErrorCode.ACCOUNT_DELETED),
      HttpStatus.UNAUTHORIZED,
      ErrorCode.ACCOUNT_DELETED,
    );
  }

  return scopeFromActorGroupId(record.groupId);
}

/**
 * Escopo para recursos **administrativos** (só COORDINATOR restrito). Centraliza
 * o padrão usado por list/remove/resend (users) e pela list/export de grupos.
 */
export function resolveActorGroupScope(
  actorRole: UserRole,
  actorId: string,
  lookup: ActorGroupLookup,
  errorMessageService: ErrorMessageService,
): Promise<UserGroupScope> {
  return resolveScopeForRoles(
    actorRole,
    actorId,
    lookup,
    errorMessageService,
    GROUP_SCOPED_ROLES,
  );
}

/**
 * Escopo para recursos **operacionais** (COORDINATOR + OPERATOR + TECHNICAL
 * restritos ao próprio grupo). Usado por list/export de aeródromos e dos módulos
 * pendurados no aeródromo. Espelha `resolveOperationalScope` do `aerobi-web`.
 */
export function resolveOperationalActorScope(
  actorRole: UserRole,
  actorId: string,
  lookup: ActorGroupLookup,
  errorMessageService: ErrorMessageService,
): Promise<UserGroupScope> {
  return resolveScopeForRoles(
    actorRole,
    actorId,
    lookup,
    errorMessageService,
    OPERATIONAL_SCOPED_ROLES,
  );
}

/**
 * Predicado **puro** de escopo por registro (record-level) sobre o aeródromo de
 * destino, usado no create/upload quando o `aerodromeId` vem no corpo — caso em
 * que o `GroupScopeGuard` não consegue resolver o escopo por grupo. Aeródromo
 * inexistente/soft-deletado (`null`), `scope.none` (sem grupo provisionado) ou
 * fora do grupo do ator ⇒ **404** (não vaza existência), espelhando
 * `assertAerodromeAccess`/`assertAerodromeOperationalAccess` do `aerobi-web`.
 * ADMIN (`scope.all`) passa direto.
 *
 * Genérico em `T extends { groupId: string }`: devolve o aeródromo já estreitado
 * para não-`null`, preservando o tipo concreto do chamador (ex.: `documents`
 * deriva `uf` do retorno). O carregamento do aeródromo fica no repositório/
 * serviço; aqui só o gate. Centraliza o predicado antes triplicado em
 * `documents`, `technical-visits` e `maintenances`.
 */
export function assertAerodromeInScope<T extends { groupId: string }>(
  aerodrome: T | null,
  scope: UserGroupScope,
  errorMessageService: ErrorMessageService,
  aerodromeId: string,
): T {
  if (
    !aerodrome ||
    scope.kind === 'none' ||
    (scope.kind === 'group' && aerodrome.groupId !== scope.groupId)
  ) {
    throw resourceNotFound(errorMessageService, 'Aeródromo', aerodromeId);
  }
  return aerodrome;
}
