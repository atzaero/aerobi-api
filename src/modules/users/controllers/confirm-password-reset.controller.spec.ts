import type { ConfirmPasswordResetDto } from '../dtos/confirm-password-reset.dto';
import type { PasswordResetResponseDto } from '../dtos/password-reset-response.dto';
import type { ConfirmPasswordResetService } from '../services/confirm-password-reset.service';

import { ConfirmPasswordResetController } from './confirm-password-reset.controller';

describe('ConfirmPasswordResetController', () => {
  let controller: ConfirmPasswordResetController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new ConfirmPasswordResetController({
      execute,
    } as unknown as ConfirmPasswordResetService);
  });

  it('repassa o body ao service', async () => {
    const dto: ConfirmPasswordResetDto = {
      email: 'u@aerobi.local',
      token: 'plain-token',
      newPassword: 'NovaSenha123',
    };
    const result: PasswordResetResponseDto = {
      message: 'Senha redefinida com sucesso.',
    };
    execute.mockResolvedValue(result);

    await expect(controller.handle(dto)).resolves.toBe(result);
    expect(execute).toHaveBeenCalledWith(dto);
  });
});
