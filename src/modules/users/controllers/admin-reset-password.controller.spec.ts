import { buildMockRequest } from '@/common/testing/http-request.mock';
import { UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import type { PasswordResetResponseDto } from '../dtos/password-reset-response.dto';
import type { AdminResetPasswordService } from '../services/admin-reset-password.service';

import { AdminResetPasswordController } from './admin-reset-password.controller';

describe('AdminResetPasswordController', () => {
  let controller: AdminResetPasswordController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new AdminResetPasswordController({
      execute,
    } as unknown as AdminResetPasswordService);
  });

  it('repassa id (do param) e actor para o service', async () => {
    const actor: AuthenticatedUser = {
      id: 'admin-id',
      email: 'a@x',
      role: UserRole.ADMIN,
    };
    const result: PasswordResetResponseDto = {
      message: 'Se o e-mail existir, um link foi enviado.',
    };
    execute.mockResolvedValue(result);
    const request = buildMockRequest({ ip: '9.9.9.9', userAgent: 'jest-ua' });

    await expect(
      controller.handle({ id: 'target-id' }, actor, request),
    ).resolves.toBe(result);
    expect(execute).toHaveBeenCalledWith(
      'target-id',
      actor,
      expect.objectContaining({ actorId: actor.id, ipAddress: '9.9.9.9' }),
    );
  });
});
