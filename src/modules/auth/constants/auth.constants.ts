/**
 * Constantes / chaves de metadata usadas pelos decorators e guards do
 * módulo `auth`.
 *
 * - `IS_PUBLIC_KEY`: marca rotas que devem ignorar o `JwtAuthGuard`
 *   quando ele estiver registrado globalmente. Set via `@Public()`.
 * - `ROLES_KEY`: lista de roles aceitas pelo `RolesGuard`. Set via
 *   `@Roles(UserRole.ADMIN, ...)`.
 */
export const IS_PUBLIC_KEY = 'auth:isPublic';
export const ROLES_KEY = 'auth:roles';

/** Tipos válidos do claim `typ` no JWT (access vs refresh). */
export const JWT_TOKEN_TYPE = {
  ACCESS: 'access',
  REFRESH: 'refresh',
} as const;

export type JwtTokenType = (typeof JWT_TOKEN_TYPE)[keyof typeof JWT_TOKEN_TYPE];
