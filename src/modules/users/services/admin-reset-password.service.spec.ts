import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { UserRole } from '@/generated/prisma/client';

import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import type { UserRepository } from '../repositories/user.repository';
import type { RequestPasswordResetService } from './request-password-reset.service';
import { buildUserFixture } from '../testing/user.fixtures';

import { AdminResetPasswordService } from './admin-reset-password.service';

const ADMIN: AuthenticatedUser = {
  id: 'admin-1',
  email: 'a@x',
  role: UserRole.ADMIN,
};

describe('AdminResetPasswordService', () => {
  let service: AdminResetPasswordService;
  let findActiveById: jest.Mock;
  let requestExecute: jest.Mock;

  beforeEach(() => {
    findActiveById = jest.fn();
    requestExecute = jest
      .fn()
      .mockResolvedValue({ message: 'Se o email estiver registrado...' });

    const userRepository = { findActiveById } as unknown as UserRepository;
    const requestPasswordResetService = {
      execute: requestExecute,
    } as unknown as RequestPasswordResetService;

    service = new AdminResetPasswordService(
      userRepository,
      requestPasswordResetService,
      new ErrorMessageService(),
    );
  });

  it('usuário existente → dispara o fluxo de reset com o email do alvo', async () => {
    findActiveById.mockResolvedValue(
      buildUserFixture({ id: 'u-1', email: 'target@x' }),
    );

    const result = await service.execute('u-1', ADMIN);

    expect(requestExecute).toHaveBeenCalledWith({ email: 'target@x' });
    expect(result.message).toBeDefined();
  });

  it('usuário inexistente → USER_NOT_FOUND', async () => {
    findActiveById.mockResolvedValue(null);

    const p = service.execute('ghost', ADMIN);
    await expect(p).rejects.toBeInstanceOf(CustomHttpException);
    await p.catch((e) =>
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.USER_NOT_FOUND,
      ),
    );
    expect(requestExecute).not.toHaveBeenCalled();
  });
});
