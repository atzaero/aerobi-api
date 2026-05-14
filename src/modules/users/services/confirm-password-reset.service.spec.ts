import { EventEmitter2 } from '@nestjs/event-emitter';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import type { RefreshTokenRepository } from '@/modules/auth/repositories/refresh-token.repository';
import { TokenValidationService } from '@/modules/tokens/services/token-validation.service';

import type { UserRepository } from '../repositories/user.repository';
import { buildUserFixture } from '../testing/user.fixtures';

import { ConfirmPasswordResetService } from './confirm-password-reset.service';

/** Local helper — só ajusta o email para o que o spec usa. */
function buildUser() {
  return buildUserFixture({ email: 'u@x' });
}

describe('ConfirmPasswordResetService', () => {
  let service: ConfirmPasswordResetService;

  let findByEmail: jest.Mock;
  let update: jest.Mock;
  let validate: jest.Mock;
  let markAsUsed: jest.Mock;
  let revokeAllForUser: jest.Mock;
  let emit: jest.Mock;

  beforeEach(() => {
    findByEmail = jest.fn();
    update = jest.fn();
    validate = jest.fn();
    markAsUsed = jest.fn();
    revokeAllForUser = jest.fn();
    emit = jest.fn();

    const userRepository = {
      findByEmail,
      findById: jest.fn(),
      findActiveById: jest.fn(),
      existsByEmail: jest.fn(),
      create: jest.fn(),
      update,
      softDelete: jest.fn(),
      findManyPaginated: jest.fn(),
    } as unknown as UserRepository;

    const tokenValidation = {
      validate,
      markAsUsed,
    } as unknown as TokenValidationService;

    const refreshTokenRepository = {
      create: jest.fn(),
      findByJti: jest.fn(),
      rotate: jest.fn(),
      revokeById: jest.fn(),
      revokeAllForUser,
    } as unknown as RefreshTokenRepository;

    const eventEmitter = { emit } as unknown as EventEmitter2;

    service = new ConfirmPasswordResetService(
      userRepository,
      tokenValidation,
      refreshTokenRepository,
      eventEmitter,
      new ErrorMessageService(),
    );
  });

  it('confirma reset, hasheia senha, revoga refresh tokens e emite evento', async () => {
    findByEmail.mockResolvedValue(buildUser());
    validate.mockResolvedValue({ id: 'tok-1' });
    revokeAllForUser.mockResolvedValue(2);
    update.mockResolvedValue(buildUser());

    const result = await service.execute({
      email: 'u@x',
      token: 'plain',
      newPassword: 'NovaSenha123',
    });

    expect(update).toHaveBeenCalledTimes(1);
    const updateCalls = update.mock.calls as Array<
      [string, { password?: string }]
    >;
    expect(updateCalls[0][0]).toBe('user-1');
    expect(typeof updateCalls[0][1].password).toBe('string');
    expect(markAsUsed).toHaveBeenCalledWith('tok-1', 'user-1');
    expect(revokeAllForUser).toHaveBeenCalledWith('user-1');
    expect(emit).toHaveBeenCalledWith(
      'password-reset.succeeded',
      expect.objectContaining({ userId: 'user-1', revokedRefreshCount: 2 }),
    );
    expect(result.message).toContain('sucesso');
  });

  it('user inexistente → PASSWORD_RESET_TOKEN_INVALID', async () => {
    findByEmail.mockResolvedValue(null);

    try {
      await service.execute({
        email: 'x@x',
        token: 't',
        newPassword: 'NovaSenha123',
      });
      fail('should have thrown');
    } catch (e) {
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.PASSWORD_RESET_TOKEN_INVALID,
      );
    }
  });

  it('token inválido → PASSWORD_RESET_TOKEN_INVALID', async () => {
    findByEmail.mockResolvedValue(buildUser());
    validate.mockRejectedValue(new Error('token invalid'));

    try {
      await service.execute({
        email: 'u@x',
        token: 't',
        newPassword: 'NovaSenha123',
      });
      fail('should have thrown');
    } catch (e) {
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.PASSWORD_RESET_TOKEN_INVALID,
      );
    }
  });

  // A validação de força de senha foi movida para o DTO via
  // `@IsStrongPassword()` — o `ValidationPipe` rejeita antes de chegar
  // no service. Cobertura específica em
  // `src/common/validators/is-strong-password.validator.spec.ts`.
});
