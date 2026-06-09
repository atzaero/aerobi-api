import { UserRole } from '@/generated/prisma/client';

import type { AuthenticatedUser } from '../interfaces/authenticated-user.interface';
import { permissionsForRole } from '../permissions';
import { AuthResponseMapperService } from '../services/auth-response-mapper.service';

import { MeController } from './me.controller';

describe('MeController', () => {
  const mapper = new AuthResponseMapperService();
  const controller = new MeController(mapper);

  const user: AuthenticatedUser = {
    id: 'user-1',
    email: 'operator@aerobi.test',
    role: UserRole.OPERATOR,
  };

  it('delega ao mapper e devolve as claims do usuário injetado', () => {
    const result = controller.handle(user);

    expect(result).toEqual({
      id: 'user-1',
      email: 'operator@aerobi.test',
      role: UserRole.OPERATOR,
      permissions: permissionsForRole(UserRole.OPERATOR),
    });
  });

  it('expõe as permissions resolvidas para o role no payload', () => {
    const result = controller.handle(user);

    expect(result.permissions.landing_request).toContain('decide');
    expect(result.permissions.aerodrome).toContain('update-observation');
  });
});
