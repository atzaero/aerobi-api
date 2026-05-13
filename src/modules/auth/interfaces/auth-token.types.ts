import type { UserRole } from '@/generated/prisma/client';

/** Sujeito mínimo para emitir um JWT (claims sub/email/role). */
export interface JwtSubject {
  id: string;
  email: string;
  role: UserRole;
}

/** Contexto da sessão para audit (login/refresh). */
export interface SessionContext {
  userAgent?: string;
  ipAddress?: string;
}

/** Resultado de emissão/rotação de par access+refresh. */
export interface IssuedTokenPair {
  accessToken: string;
  accessExpiresAt: Date;
  refreshToken: string;
  refreshExpiresAt: Date;
  refreshTokenId: string;
}
