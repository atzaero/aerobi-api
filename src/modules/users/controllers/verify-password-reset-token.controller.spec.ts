import type { VerifyPasswordResetTokenDto } from '../dtos/verify-password-reset-token.dto';
import type { VerifyPasswordResetTokenService } from '../services/verify-password-reset-token.service';

import { VerifyPasswordResetTokenController } from './verify-password-reset-token.controller';

describe('VerifyPasswordResetTokenController', () => {
  let controller: VerifyPasswordResetTokenController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new VerifyPasswordResetTokenController({
      execute,
    } as unknown as VerifyPasswordResetTokenService);
  });

  it('repassa o body ao service', async () => {
    const dto: VerifyPasswordResetTokenDto = {
      email: 'u@aerobi.local',
      token: 'plain-token',
    };
    execute.mockResolvedValue({ valid: true });

    await expect(controller.handle(dto)).resolves.toEqual({ valid: true });
    expect(execute).toHaveBeenCalledWith(dto);
  });
});
