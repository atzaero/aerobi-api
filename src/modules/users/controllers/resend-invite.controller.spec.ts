import { ErrorCode } from '@/common/enums/error-code.enum';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import type { UserResponseDto } from '../dtos/user-response.dto';
import type { ResendInviteService } from '../services/resend-invite.service';
import {
  readRequiredPermission,
  runPermissionsGuard,
} from '../testing/permissions-guard.harness';

import { ResendInviteController } from './resend-invite.controller';

describe('ResendInviteController', () => {
  let controller: ResendInviteController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new ResendInviteController({
      execute,
    } as unknown as ResendInviteService);
  });

  it('monta input { userId, actorId, actorRole } a partir de param + actor', async () => {
    const actor: AuthenticatedUser = {
      id: 'admin-1',
      email: 'a@x',
      role: UserRole.ADMIN,
    };
    const refreshed = { id: 'target', email: 'p@x' } as UserResponseDto;
    execute.mockResolvedValue(refreshed);

    await expect(controller.handle({ id: 'target' }, actor)).resolves.toBe(
      refreshed,
    );
    expect(execute).toHaveBeenCalledWith({
      userId: 'target',
      actorId: 'admin-1',
      actorRole: UserRole.ADMIN,
    });
  });

  describe('autorização (@RequirePermission user:create)', () => {
    it('declara a permissão user:create', () => {
      expect(readRequiredPermission(ResendInviteController, 'handle')).toEqual({
        subject: 'user',
        action: 'create',
      });
    });

    it.each([UserRole.ADMIN, UserRole.COORDINATOR])(
      'autoriza %s (2xx)',
      (role) => {
        expect(
          runPermissionsGuard(ResendInviteController, 'handle', role),
        ).toBe(true);
      },
    );

    it.each([UserRole.OPERATOR, UserRole.TECHNICAL])(
      'nega %s (403 FORBIDDEN)',
      (role) => {
        try {
          runPermissionsGuard(ResendInviteController, 'handle', role);
          fail('should have thrown');
        } catch (e) {
          expect((e as CustomHttpException).getErrorCode()).toBe(
            ErrorCode.FORBIDDEN,
          );
        }
      },
    );
  });
});
