import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { UserRole } from '@/generated/prisma/client';

import type { RefreshTokenRepository } from '@/modules/auth/repositories/refresh-token.repository';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import type { UserRepository } from '../repositories/user.repository';
import {
  buildUserFixture,
  buildPendingUserFixture,
} from '../testing/user.fixtures';

import { ChangePasswordService } from './change-password.service';

jest.mock('../utils/password-hash.util', () => ({
  comparePassword: jest.fn(),
  hashPassword: jest.fn(),
}));
import { comparePassword, hashPassword } from '../utils/password-hash.util';

const compareMock = comparePassword as jest.Mock;
const hashMock = hashPassword as jest.Mock;

const ACTOR: AuthenticatedUser = {
  id: 'user-1',
  email: 'u@x',
  role: UserRole.OPERATOR,
};

describe('ChangePasswordService', () => {
  let service: ChangePasswordService;
  let findActiveById: jest.Mock;
  let update: jest.Mock;
  let revokeAllForUser: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    findActiveById = jest.fn();
    update = jest.fn();
    revokeAllForUser = jest.fn().mockResolvedValue(1);

    const userRepository = {
      findActiveById,
      update,
    } as unknown as UserRepository;
    const refreshTokenRepository = {
      revokeAllForUser,
    } as unknown as RefreshTokenRepository;

    service = new ChangePasswordService(
      userRepository,
      refreshTokenRepository,
      new ErrorMessageService(),
    );
  });

  it('senha atual correta → grava nova senha e revoga sessões', async () => {
    findActiveById.mockResolvedValue(buildUserFixture({ id: 'user-1' }));
    compareMock.mockResolvedValue(true);
    hashMock.mockResolvedValue('new-hash');

    const result = await service.execute(ACTOR, {
      currentPassword: 'OldPass1',
      newPassword: 'NewPass1',
    });

    expect(update).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({ password: 'new-hash', updatedBy: 'user-1' }),
    );
    expect(revokeAllForUser).toHaveBeenCalledWith('user-1');
    expect(result.message).toMatch(/sucesso/i);
  });

  it('senha atual incorreta → INVALID_CREDENTIALS', async () => {
    findActiveById.mockResolvedValue(buildUserFixture({ id: 'user-1' }));
    compareMock.mockResolvedValue(false);

    const p = service.execute(ACTOR, {
      currentPassword: 'Wrong1',
      newPassword: 'NewPass1',
    });
    await expect(p).rejects.toBeInstanceOf(CustomHttpException);
    await p.catch((e) =>
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.INVALID_CREDENTIALS,
      ),
    );
    expect(update).not.toHaveBeenCalled();
  });

  it('conta sem senha (convite pendente) → INVALID_CREDENTIALS', async () => {
    findActiveById.mockResolvedValue(buildPendingUserFixture({ id: 'user-1' }));

    const p = service.execute(ACTOR, {
      currentPassword: 'X',
      newPassword: 'NewPass1',
    });
    await expect(p).rejects.toBeInstanceOf(CustomHttpException);
    await p.catch((e) =>
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.INVALID_CREDENTIALS,
      ),
    );
    expect(compareMock).not.toHaveBeenCalled();
  });

  it('conta soft-deletada → ACCOUNT_DELETED', async () => {
    findActiveById.mockResolvedValue(null);

    const p = service.execute(ACTOR, {
      currentPassword: 'X',
      newPassword: 'NewPass1',
    });
    await expect(p).rejects.toBeInstanceOf(CustomHttpException);
    await p.catch((e) =>
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.ACCOUNT_DELETED,
      ),
    );
  });
});
