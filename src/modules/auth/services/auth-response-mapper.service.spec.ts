import { UserRole } from '@/generated/prisma/client';

import type { AuthenticatedUser } from '../interfaces/authenticated-user.interface';
import { permissionsForRole } from '../permissions';

import { AuthResponseMapperService } from './auth-response-mapper.service';

function buildAuthenticatedUser(
  overrides: Partial<AuthenticatedUser> = {},
): AuthenticatedUser {
  return {
    id: 'user-1',
    email: 'user@aerobi.test',
    role: UserRole.OPERATOR,
    ...overrides,
  };
}

describe('AuthResponseMapperService.toMeResponse', () => {
  const mapper = new AuthResponseMapperService();

  it('projeta as claims do JWT sem round-trip ao DB', () => {
    const user = buildAuthenticatedUser({
      id: 'abc',
      email: 'admin@aerobi.test',
      role: UserRole.ADMIN,
    });

    const result = mapper.toMeResponse(user);

    expect(result.id).toBe('abc');
    expect(result.email).toBe('admin@aerobi.test');
    expect(result.role).toBe(UserRole.ADMIN);
  });

  it('inclui permissions já resolvidas para o role (== permissionsForRole)', () => {
    const user = buildAuthenticatedUser({ role: UserRole.COORDINATOR });

    const result = mapper.toMeResponse(user);

    expect(result.permissions).toEqual(
      permissionsForRole(UserRole.COORDINATOR),
    );
  });

  it('resolve permissões distintas por role', () => {
    const admin = mapper.toMeResponse(
      buildAuthenticatedUser({ role: UserRole.ADMIN }),
    );
    const technical = mapper.toMeResponse(
      buildAuthenticatedUser({ role: UserRole.TECHNICAL }),
    );

    // ADMIN enxerga gestão de usuários; TECHNICAL não.
    expect(admin.permissions.user).toContain('update');
    expect(technical.permissions.user).toBeUndefined();
    // TECHNICAL mantém a sua função-base (visita técnica).
    expect(technical.permissions.technical_visit).toContain('export');
  });

  it('não vaza permissões no shape do role errado (deny-by-default)', () => {
    const operator = mapper.toMeResponse(
      buildAuthenticatedUser({ role: UserRole.OPERATOR }),
    );

    expect(operator.permissions.group).toBeUndefined();
    expect(operator.permissions.aerodrome).not.toContain('delete');
  });
});
