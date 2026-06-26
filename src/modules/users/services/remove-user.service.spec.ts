import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { Uf, UserRole } from '@/generated/prisma/client';
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

/** Registro do COORDINATOR ator com grupo provisionado (group-a / SP). */
const COORD_RECORD = buildUserFixture({
  id: 'coord-1',
  role: UserRole.COORDINATOR,
  aerodromeGroupId: 'group-a',
  state: Uf.SP,
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

  /**
   * O service chama `findActiveById` duas vezes (ator e alvo). Roteia o mock
   * por id: o ator (`admin-1`/`coord-1`) e o alvo (`target`).
   */
  function routeFindActiveById(
    actorRecord: ReturnType<typeof buildUserFixture> | null,
    targetRecord: ReturnType<typeof buildUserFixture> | null,
  ): void {
    findActiveById.mockImplementation((id: string) =>
      Promise.resolve(id === 'target' ? targetRecord : actorRecord),
    );
  }

  it('ADMIN remove qualquer role → soft-delete + revoga refresh tokens', async () => {
    routeFindActiveById(
      null, // ADMIN → scope `all`, não depende do próprio registro
      buildUserFixture({ id: 'target', role: UserRole.COORDINATOR }),
    );
    revokeAllForUser.mockResolvedValue(2);

    await expect(service.execute('target', ADMIN)).resolves.toBeUndefined();
    expect(softDelete).toHaveBeenCalledWith('target', 'admin-1');
    expect(revokeAllForUser).toHaveBeenCalledWith('target');
  });

  it('ADMIN: user inexistente → USER_NOT_FOUND', async () => {
    routeFindActiveById(null, null);

    try {
      await service.execute('target', ADMIN);
      fail('should have thrown');
    } catch (e) {
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.USER_NOT_FOUND,
      );
    }
    expect(softDelete).not.toHaveBeenCalled();
  });

  it('auto-exclusão → VALIDATION_FAILED (sem soft-delete)', async () => {
    try {
      await service.execute('admin-1', ADMIN);
      fail('should have thrown');
    } catch (e) {
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.VALIDATION_FAILED,
      );
    }
    expect(softDelete).not.toHaveBeenCalled();
  });

  describe('escopo por grupo (COORDINATOR)', () => {
    it.each([UserRole.OPERATOR, UserRole.TECHNICAL])(
      'remove %s do próprio grupo → permitido',
      async (targetRole) => {
        routeFindActiveById(
          COORD_RECORD,
          buildUserFixture({
            id: 'target',
            role: targetRole,
            aerodromeGroupId: 'group-a',
          }),
        );
        revokeAllForUser.mockResolvedValue(0);

        await expect(
          service.execute('target', COORDINATOR),
        ).resolves.toBeUndefined();
        expect(softDelete).toHaveBeenCalledWith('target', 'coord-1');
      },
    );

    it.each([UserRole.ADMIN, UserRole.COORDINATOR])(
      'remove %s (não gerível) → USER_NOT_FOUND (não vaza)',
      async (targetRole) => {
        routeFindActiveById(
          COORD_RECORD,
          buildUserFixture({
            id: 'target',
            role: targetRole,
            aerodromeGroupId: 'group-a',
          }),
        );

        try {
          await service.execute('target', COORDINATOR);
          fail('should have thrown');
        } catch (e) {
          expect((e as CustomHttpException).getErrorCode()).toBe(
            ErrorCode.USER_NOT_FOUND,
          );
        }
        expect(softDelete).not.toHaveBeenCalled();
        expect(revokeAllForUser).not.toHaveBeenCalled();
      },
    );

    it('remove OPERATOR de outro grupo → USER_NOT_FOUND', async () => {
      routeFindActiveById(
        COORD_RECORD,
        buildUserFixture({
          id: 'target',
          role: UserRole.OPERATOR,
          aerodromeGroupId: 'group-b',
        }),
      );

      try {
        await service.execute('target', COORDINATOR);
        fail('should have thrown');
      } catch (e) {
        expect((e as CustomHttpException).getErrorCode()).toBe(
          ErrorCode.USER_NOT_FOUND,
        );
      }
      expect(softDelete).not.toHaveBeenCalled();
    });

    it('COORDINATOR sem grupo provisionado → FORBIDDEN', async () => {
      routeFindActiveById(
        buildUserFixture({
          id: 'coord-1',
          role: UserRole.COORDINATOR,
          aerodromeGroupId: null,
          state: null,
        }),
        buildUserFixture({ id: 'target', role: UserRole.OPERATOR }),
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
    });

    it('COORDINATOR inativo/soft-deletado (registro null) → 401 ACCOUNT_DELETED', async () => {
      routeFindActiveById(
        null,
        buildUserFixture({ id: 'target', role: UserRole.OPERATOR }),
      );

      try {
        await service.execute('target', COORDINATOR);
        fail('should have thrown');
      } catch (e) {
        expect((e as CustomHttpException).getErrorCode()).toBe(
          ErrorCode.ACCOUNT_DELETED,
        );
        expect((e as CustomHttpException).getStatus()).toBe(401);
      }
      expect(softDelete).not.toHaveBeenCalled();
    });
  });
});
