import { HttpStatus } from '@nestjs/common';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { IssueTokenPairService } from '@/modules/auth/services/issue-token-pair.service';
import { TokenValidationService } from '@/modules/tokens/services/token-validation.service';

import type { UserRepository } from '../repositories/user.repository';
import { buildPendingUserFixture } from '../testing/user.fixtures';

import { AcceptInviteService } from './accept-invite.service';

describe('AcceptInviteService', () => {
  let service: AcceptInviteService;

  let findByEmail: jest.Mock;
  let update: jest.Mock;
  let validate: jest.Mock;
  let markAsUsed: jest.Mock;
  let issuePair: jest.Mock;

  beforeEach(() => {
    findByEmail = jest.fn();
    update = jest.fn();
    validate = jest.fn();
    markAsUsed = jest.fn();
    issuePair = jest.fn();

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

    const issueTokenPair = {
      execute: issuePair,
    } as unknown as IssueTokenPairService;

    service = new AcceptInviteService(
      userRepository,
      tokenValidation,
      issueTokenPair,
      new ErrorMessageService(),
    );
  });

  it('aceita convite, atualiza user e emite par JWT', async () => {
    const pending = buildPendingUserFixture();
    findByEmail.mockResolvedValue(pending);
    validate.mockResolvedValue({ id: 'tok-1' });
    update.mockResolvedValue({
      ...pending,
      password: 'hashed',
      emailVerified: true,
    });
    issuePair.mockResolvedValue({
      accessToken: 'a',
      refreshToken: 'r',
      accessExpiresAt: new Date(),
      refreshExpiresAt: new Date(),
      refreshTokenId: 'rt',
    });

    const result = await service.execute({
      email: 'piloto@aerobi.local',
      token: 'plain',
      password: 'NovaSenha123',
    });

    expect(validate).toHaveBeenCalledWith('plain', 'user-1', 'INVITE');
    expect(update).toHaveBeenCalledTimes(1);
    const updateCalls = update.mock.calls as Array<
      [string, { emailVerified?: boolean; acceptedInviteAt?: Date }]
    >;
    expect(updateCalls[0][0]).toBe('user-1');
    expect(updateCalls[0][1].emailVerified).toBe(true);
    expect(updateCalls[0][1].acceptedInviteAt).toBeInstanceOf(Date);
    expect(markAsUsed).toHaveBeenCalledWith('tok-1', 'user-1');
    expect(issuePair).toHaveBeenCalledTimes(1);
    expect(result.accessToken).toBe('a');
  });

  it('user inexistente → INVITE_TOKEN_INVALID', async () => {
    findByEmail.mockResolvedValue(null);

    try {
      await service.execute({
        email: 'inexistente@x.com',
        token: 't',
        password: 'NovaSenha123',
      });
      fail('should have thrown');
    } catch (e) {
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.INVITE_TOKEN_INVALID,
      );
    }
  });

  it('convite já aceito → INVITE_ALREADY_ACCEPTED', async () => {
    findByEmail.mockResolvedValue({
      ...buildPendingUserFixture(),
      acceptedInviteAt: new Date(),
    });

    try {
      await service.execute({
        email: 'piloto@aerobi.local',
        token: 't',
        password: 'NovaSenha123',
      });
      fail('should have thrown');
    } catch (e) {
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.INVITE_ALREADY_ACCEPTED,
      );
    }
  });

  it('token expirado vira INVITE_TOKEN_EXPIRED', async () => {
    findByEmail.mockResolvedValue(buildPendingUserFixture());
    validate.mockRejectedValue(
      new CustomHttpException(
        'Token expirado em ...',
        HttpStatus.BAD_REQUEST,
        ErrorCode.TOKEN_EXPIRED,
      ),
    );

    try {
      await service.execute({
        email: 'piloto@aerobi.local',
        token: 't',
        password: 'NovaSenha123',
      });
      fail('should have thrown');
    } catch (e) {
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.INVITE_TOKEN_EXPIRED,
      );
    }
  });

  // A validação de força de senha foi movida para o DTO via
  // `@IsStrongPassword()` — o `ValidationPipe` rejeita antes de chegar
  // no service. Cobertura específica em
  // `src/common/validators/is-strong-password.validator.spec.ts`.
});
