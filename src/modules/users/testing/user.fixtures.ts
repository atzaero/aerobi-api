import type { User } from '@/generated/prisma/client';
import { UserRole } from '@/generated/prisma/client';

/**
 * Fixtures centralizados de `User` para uso em testes do módulo `users/`
 * e `auth/`. Padrão builder com `Partial<User>` para overrides.
 *
 * **Quando usar cada um:**
 *  - `buildUserFixture()` — usuário ativo (já aceitou convite); password
 *    hash presente, `emailVerified=true`, `acceptedInviteAt` setado.
 *  - `buildPendingUserFixture()` — usuário convidado que **ainda não
 *    aceitou**; `password=null`, `emailVerified=false`,
 *    `acceptedInviteAt=null`.
 *
 * Use overrides para customizar campos específicos:
 *
 * @example
 * ```ts
 * buildUserFixture({ role: UserRole.ADMIN, deletedAt: new Date() })
 * ```
 */
const REFERENCE_DATE = new Date('2026-05-14T00:00:00.000Z');

/** Usuário já ativado (convite aceito, password definido). */
export function buildUserFixture(overrides: Partial<User> = {}): User {
  return {
    id: 'user-1',
    email: 'user@aerobi.local',
    name: 'User',
    phone: null,
    password: 'hashed',
    role: UserRole.OPERATOR,
    emailVerified: true,
    timezone: null,
    lastLoginAt: null,
    invitedById: null,
    invitedAt: null,
    acceptedInviteAt: REFERENCE_DATE,
    deletedAt: null,
    deletedBy: null,
    createdAt: REFERENCE_DATE,
    createdBy: null,
    updatedAt: REFERENCE_DATE,
    updatedBy: null,
    ...overrides,
  };
}

/** Usuário convidado mas ainda **não** aceitou (password ausente). */
export function buildPendingUserFixture(overrides: Partial<User> = {}): User {
  return buildUserFixture({
    email: 'piloto@aerobi.local',
    name: 'Piloto',
    password: null,
    emailVerified: false,
    invitedById: 'admin-1',
    invitedAt: REFERENCE_DATE,
    acceptedInviteAt: null,
    ...overrides,
  });
}
