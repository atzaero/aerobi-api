/**
 * Constantes / chaves de metadata usadas pelos decorators e guards do
 * módulo `auth`.
 *
 * - `IS_PUBLIC_KEY`: marca rotas que devem ignorar o `JwtAuthGuard`
 *   quando ele estiver registrado globalmente. Set via `@Public()`.
 * - `ROLES_KEY`: lista de roles aceitas pelo `RolesGuard`. Set via
 *   `@Roles(UserRole.ADMIN, ...)`.
 * - `PERMISSION_KEY`: par `{ subject, action }` exigido pelo
 *   `PermissionsGuard`. Set via `@RequirePermission(subject, action)`.
 * - `GROUP_SCOPE_KEY`: subject do recurso a checar pelo `GroupScopeGuard`.
 *   Set via `@RequiresGroupScope(GroupScopeSubject.AERODROME)`.
 */
export const IS_PUBLIC_KEY = 'auth:isPublic';
export const ROLES_KEY = 'auth:roles';
export const PERMISSION_KEY = 'auth:permission';
export const GROUP_SCOPE_KEY = 'auth:groupScope';
/** Nome do parâmetro de rota com o id do recurso (default `id`). */
export const GROUP_SCOPE_PARAM_KEY = 'auth:groupScopeParam';

/** Tipos válidos do claim `typ` no JWT (access vs refresh). */
export const JWT_TOKEN_TYPE = {
  ACCESS: 'access',
  REFRESH: 'refresh',
} as const;

export type JwtTokenType = (typeof JWT_TOKEN_TYPE)[keyof typeof JWT_TOKEN_TYPE];
