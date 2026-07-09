import type { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { resolveDashboardAerodromeScope } from './dashboard-scope.util';

const ems = {
  getMessage: jest.fn(() => 'msg'),
} as unknown as ErrorMessageService;

const actor = (role: UserRole): AuthenticatedUser => ({
  id: 'actor-1',
  email: 'a@a.com',
  role,
});

describe('resolveDashboardAerodromeScope', () => {
  let lookup: { findActiveById: jest.Mock };
  let source: { findActiveIdsByGroup: jest.Mock };

  beforeEach(() => {
    lookup = { findActiveById: jest.fn() };
    source = { findActiveIdsByGroup: jest.fn() };
  });

  it('ADMIN → all (aerodromeIds null, sem materializar grupo)', async () => {
    const scope = await resolveDashboardAerodromeScope(
      actor(UserRole.ADMIN),
      lookup,
      source,
      ems,
    );

    expect(scope).toEqual({ scopeKind: 'all', aerodromeIds: null });
    expect(lookup.findActiveById).not.toHaveBeenCalled();
    expect(source.findActiveIdsByGroup).not.toHaveBeenCalled();
  });

  it.each([UserRole.COORDINATOR, UserRole.OPERATOR, UserRole.TECHNICAL])(
    '%s com grupo → group (materializa os ids do grupo)',
    async (role) => {
      lookup.findActiveById.mockResolvedValue({ groupId: 'g-1' });
      source.findActiveIdsByGroup.mockResolvedValue(['a-1', 'a-2']);

      const scope = await resolveDashboardAerodromeScope(
        actor(role),
        lookup,
        source,
        ems,
      );

      expect(scope).toEqual({
        scopeKind: 'group',
        aerodromeIds: ['a-1', 'a-2'],
      });
      expect(source.findActiveIdsByGroup).toHaveBeenCalledWith('g-1');
    },
  );

  it('papel escopado sem grupo → none (aerodromeIds []), sem materializar', async () => {
    lookup.findActiveById.mockResolvedValue({ groupId: null });

    const scope = await resolveDashboardAerodromeScope(
      actor(UserRole.COORDINATOR),
      lookup,
      source,
      ems,
    );

    expect(scope).toEqual({ scopeKind: 'none', aerodromeIds: [] });
    expect(source.findActiveIdsByGroup).not.toHaveBeenCalled();
  });
});
