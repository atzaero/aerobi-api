import { ErrorCode } from '@/common/enums/error-code.enum';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { buildMockRequest } from '@/common/testing/http-request.mock';
import { UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import type { RemoveUserService } from '../services/remove-user.service';
import {
  readRequiredPermission,
  runPermissionsGuard,
} from '../testing/permissions-guard.harness';

import { RemoveUserController } from './remove-user.controller';

describe('RemoveUserController', () => {
  let controller: RemoveUserController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new RemoveUserController({
      execute,
    } as unknown as RemoveUserService);
  });

  it('repassa id (param) + actor para o service', async () => {
    const actor: AuthenticatedUser = {
      id: 'admin-1',
      email: 'a@x',
      role: UserRole.ADMIN,
    };
    execute.mockResolvedValue(undefined);
    const request = buildMockRequest({ ip: '9.9.9.9', userAgent: 'jest-ua' });

    await expect(
      controller.handle({ id: 'target-id' }, actor, request),
    ).resolves.toBeUndefined();
    expect(execute).toHaveBeenCalledWith(
      'target-id',
      actor,
      expect.objectContaining({ actorId: actor.id, ipAddress: '9.9.9.9' }),
    );
  });

  describe('autorização (@RequirePermission user:delete)', () => {
    it('declara a permissão user:delete', () => {
      expect(readRequiredPermission(RemoveUserController, 'handle')).toEqual({
        subject: 'user',
        action: 'delete',
      });
    });

    it.each([UserRole.ADMIN, UserRole.COORDINATOR])(
      'autoriza %s (2xx)',
      (role) => {
        expect(runPermissionsGuard(RemoveUserController, 'handle', role)).toBe(
          true,
        );
      },
    );

    it.each([UserRole.OPERATOR, UserRole.TECHNICAL])(
      'nega %s (403 FORBIDDEN)',
      (role) => {
        try {
          runPermissionsGuard(RemoveUserController, 'handle', role);
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
