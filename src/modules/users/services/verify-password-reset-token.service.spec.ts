import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { TokenType } from '@/generated/prisma/enums';
import { TokenValidationService } from '@/modules/tokens/services/token-validation.service';

import type { UserRepository } from '../repositories/user.repository';
import { buildUserFixture } from '../testing/user.fixtures';

import { VerifyPasswordResetTokenService } from './verify-password-reset-token.service';

describe('VerifyPasswordResetTokenService', () => {
  let service: VerifyPasswordResetTokenService;

  let findByEmail: jest.Mock;
  let validate: jest.Mock;

  beforeEach(() => {
    findByEmail = jest.fn();
    validate = jest.fn();

    const userRepository = { findByEmail } as unknown as UserRepository;
    const tokenValidation = {
      validate,
    } as unknown as TokenValidationService;

    service = new VerifyPasswordResetTokenService(
      userRepository,
      tokenValidation,
      new ErrorMessageService(),
    );
  });

  /** Captura o ErrorCode lançado, falhando se nada for lançado. */
  async function expectInvalid(promise: Promise<unknown>) {
    await expect(promise).rejects.toBeInstanceOf(CustomHttpException);
    await promise.catch((e) =>
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.PASSWORD_RESET_TOKEN_INVALID,
      ),
    );
  }

  it('token válido para usuário ativo → { valid: true } sem consumir o token', async () => {
    findByEmail.mockResolvedValue(
      buildUserFixture({ id: 'u-1', email: 'u@x' }),
    );
    validate.mockResolvedValue({ id: 'tok-1' });

    const result = await service.execute({ email: 'u@x', token: 'plain' });

    expect(result).toEqual({ valid: true });
    expect(validate).toHaveBeenCalledWith(
      'plain',
      'u-1',
      TokenType.PASSWORD_RESET,
    );
  });

  it('usuário inexistente → PASSWORD_RESET_TOKEN_INVALID sem validar token', async () => {
    findByEmail.mockResolvedValue(null);

    await expectInvalid(service.execute({ email: 'ghost@x', token: 'plain' }));
    expect(validate).not.toHaveBeenCalled();
  });

  it('usuário soft-deletado → PASSWORD_RESET_TOKEN_INVALID sem validar token', async () => {
    findByEmail.mockResolvedValue(
      buildUserFixture({ email: 'u@x', deletedAt: new Date() }),
    );

    await expectInvalid(service.execute({ email: 'u@x', token: 'plain' }));
    expect(validate).not.toHaveBeenCalled();
  });

  it('token rejeitado pela validação → PASSWORD_RESET_TOKEN_INVALID', async () => {
    findByEmail.mockResolvedValue(
      buildUserFixture({ id: 'u-1', email: 'u@x' }),
    );
    validate.mockRejectedValue(new Error('expirado'));

    await expectInvalid(service.execute({ email: 'u@x', token: 'plain' }));
    expect(validate).toHaveBeenCalledTimes(1);
  });
});
