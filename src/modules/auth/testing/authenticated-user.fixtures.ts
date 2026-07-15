import { UserRole } from '@/generated/prisma/client';

import type { AuthenticatedUser } from '../interfaces/authenticated-user.interface';

/**
 * Fixture do payload de `AuthenticatedUser` (decoded JWT) para specs
 * de guards e controllers que usam `@CurrentUser()`.
 */
export function buildAuthenticatedUserFixture(
  overrides: Partial<AuthenticatedUser> = {},
): AuthenticatedUser {
  return {
    id: 'user-1',
    email: 'user@aerobi.local',
    role: UserRole.OPERATOR,
    ...overrides,
  };
}
