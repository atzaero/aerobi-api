import type { UserRole } from '@/generated/prisma/client';

/**
 * Forma compacta do usuário autenticado, injetada em controllers via
 * `@CurrentUser()` após o `JwtAuthGuard` validar o token.
 *
 * Mantida estável (sub-set de `User`) para evitar acoplamento do código
 * de domínio ao schema completo.
 */
export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
}
