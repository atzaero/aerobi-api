import type { UserRole } from '@/generated/prisma/client';

import type { JwtTokenType } from '../constants/auth.constants';

/**
 * Payload assinado em todos os JWTs emitidos pela Aerobi (access + refresh).
 *
 * - `sub`: id do usuário (UUID)
 * - `email`: replicado para que o frontend tenha o email sem chamar `/auth/me`
 *   imediatamente após login
 * - `role`: usado pelo `RolesGuard` sem precisar de round-trip ao DB
 * - `typ`: distingue access de refresh — strategy rejeita refresh como Bearer
 * - `jti`: id único do token; permite revogar/rotacionar individualmente
 *   sem afetar outros tokens do mesmo usuário
 * - `iat`, `exp`: padrão JWT em segundos desde epoch
 */
export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  typ: JwtTokenType;
  jti: string;
  iat?: number;
  exp?: number;
}
