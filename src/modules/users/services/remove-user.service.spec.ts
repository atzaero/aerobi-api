import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { UserRole } from '@/generated/prisma/client';
import { buildAuthenticatedUserFixture } from '@/modules/auth/testing/authenticated-user.fixtures';
import type { RefreshTokenRepository } from '@/modules/auth/repositories/refresh-token.repository';

import type { UserRepository } from '../repositories/user.repository';
import { buildUserFixture } from '../testing/user.fixtures';

import { RemoveUserService } from './remove-user.service';

const ADMIN = buildAuthenticatedUserFixture({
  id: 'admin-1',
  role: UserRole.ADMIN,
});
const COORDINATOR = buildAuthenticatedUserFixture({
  id: 'coord-1',
  role: UserRole.COORDINATOR,
});

describe('RemoveUserService', () => {
  let service: RemoveUserService;

  let findActiveById: jest.Mock;
  let softDelete: jest.Mock;
  let revokeAllForUser: jest.Mock;

  beforeEach(() => {
    findActiveById = jest.fn();
    softDelete = jest.fn();
    revokeAllForUser = jest.fn();

    const userRepository = {
      findActiveById,
      softDelete,
    } as unknown as UserRepository;

    const refreshTokenRepository = {
      revokeAllForUser,
    } as unknown as RefreshTokenRepository;

    service = new RemoveUserService(
      userRepository,
      refreshTokenRepository,
      new ErrorMessageService(),
    );
  });

  it('ADMIN remove qualquer role → soft-delete + revoga refresh tokens', async () => {
    findActiveById.mockResolvedValue(
      buildUserFixture({ id: 'target', role: UserRole.COORDINATOR }),
    );
    revokeAllForUser.mockResolvedValue(2);

    await expect(service.execute('target', ADMIN)).resolves.toBeUndefined();
    expect(softDelete).toHaveBeenCalledWith('target', 'admin-1');
    expect(revokeAllForUser).toHaveBeenCalledWith('target');
  });

  it('user inexistente → USER_NOT_FOUND', async () => {
    findActiveById.mockResolvedValue(null);

    try {
      await service.execute('ghost', ADMIN);
      fail('should have thrown');
    } catch (e) {
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.USER_NOT_FOUND,
      );
    }
    expect(softDelete).not.toHaveBeenCalled();
  });

  describe('recorte por role-alvo', () => {
    it.each([UserRole.OPERATOR, UserRole.TECHNICAL])(
      'COORDINATOR remove %s → permitido',
      async (targetRole) => {
        findActiveById.mockResolvedValue(
          buildUserFixture({ id: 'target', role: targetRole }),
        );
        revokeAllForUser.mockResolvedValue(0);

        await expect(
          service.execute('target', COORDINATOR),
        ).resolves.toBeUndefined();
        expect(softDelete).toHaveBeenCalledWith('target', 'coord-1');
      },
    );

    it.each([UserRole.ADMIN, UserRole.COORDINATOR])(
      'COORDINATOR remove %s → FORBIDDEN (sem soft-delete)',
      async (targetRole) => {
        findActiveById.mockResolvedValue(
          buildUserFixture({ id: 'target', role: targetRole }),
        );

        try {
          await service.execute('target', COORDINATOR);
          fail('should have thrown');
        } catch (e) {
          expect((e as CustomHttpException).getErrorCode()).toBe(
            ErrorCode.FORBIDDEN,
          );
        }
        expect(softDelete).not.toHaveBeenCalled();
        expect(revokeAllForUser).not.toHaveBeenCalled();
      },
    );
  });
});
