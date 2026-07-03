import { UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import type { ChangePasswordRequestDto } from '../dtos/change-password-request.dto';
import type { ChangePasswordResponseDto } from '../dtos/change-password-response.dto';
import type { ChangePasswordService } from '../services/change-password.service';

import { ChangePasswordController } from './change-password.controller';

describe('ChangePasswordController', () => {
  let controller: ChangePasswordController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new ChangePasswordController({
      execute,
    } as unknown as ChangePasswordService);
  });

  it('repassa actor e body para o service', async () => {
    const dto: ChangePasswordRequestDto = {
      currentPassword: 'old-pass',
      newPassword: 'NewStrongP@ss1',
    };
    const actor: AuthenticatedUser = {
      id: 'user-id',
      email: 'u@x',
      role: UserRole.OPERATOR,
    };
    const result: ChangePasswordResponseDto = {
      message: 'Senha alterada com sucesso.',
    };
    execute.mockResolvedValue(result);

    await expect(controller.handle(dto, actor)).resolves.toBe(result);
    expect(execute).toHaveBeenCalledWith(actor, dto);
  });
});
