import bcrypt from 'bcryptjs';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { UserRole } from '@/generated/prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

import { AuthLoginService } from './auth-login.service';
import { AuthTokenService } from './auth-token.service';

function buildUserRow(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'user-1',
    email: 'user@aerobi.local',
    name: 'User',
    password: 'hashed',
    role: UserRole.OPERATOR,
    emailVerified: true,
    deletedAt: null,
    ...overrides,
  };
}

describe('AuthLoginService', () => {
  let service: AuthLoginService;

  let userFindUnique: jest.Mock;
  let userUpdate: jest.Mock;
  let issuePair: jest.Mock;
  let bcryptCompare: jest.Mock<Promise<boolean>, [string, string]>;

  beforeEach(() => {
    userFindUnique = jest.fn();
    userUpdate = jest.fn().mockResolvedValue({ id: 'user-1' });
    issuePair = jest.fn().mockResolvedValue({
      accessToken: 'access',
      refreshToken: 'refresh',
      accessExpiresAt: new Date(),
      refreshExpiresAt: new Date(),
      refreshTokenId: 'rt-1',
    });

    const prisma = {
      user: { findUnique: userFindUnique, update: userUpdate },
    } as unknown as PrismaService;

    const authTokenService = { issuePair } as unknown as AuthTokenService;

    service = new AuthLoginService(
      prisma,
      authTokenService,
      new ErrorMessageService(),
    );

    bcryptCompare = jest.spyOn(bcrypt, 'compare') as unknown as jest.Mock<
      Promise<boolean>,
      [string, string]
    >;
    bcryptCompare.mockResolvedValue(true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('login bem-sucedido retorna par + user resumido', async () => {
    userFindUnique.mockResolvedValue(buildUserRow());

    const result = await service.execute({
      email: 'User@Aerobi.local',
      password: 'right-password',
    });

    expect(userFindUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { email: 'user@aerobi.local' } }),
    );
    expect(issuePair).toHaveBeenCalledTimes(1);
    expect(result.user.id).toBe('user-1');
    expect(result.accessToken).toBe('access');
  });

  it('email não encontrado → INVALID_CREDENTIALS (sem user enumeration)', async () => {
    userFindUnique.mockResolvedValue(null);

    try {
      await service.execute({ email: 'x@x.com', password: 'p' });
      fail('should have thrown');
    } catch (e) {
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.INVALID_CREDENTIALS,
      );
    }
  });

  it('usuário soft-deleted → INVALID_CREDENTIALS', async () => {
    userFindUnique.mockResolvedValue(buildUserRow({ deletedAt: new Date() }));

    try {
      await service.execute({ email: 'x@x.com', password: 'p' });
      fail('should have thrown');
    } catch (e) {
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.INVALID_CREDENTIALS,
      );
    }
  });

  it('password null → ACCOUNT_NOT_ACTIVATED', async () => {
    userFindUnique.mockResolvedValue(buildUserRow({ password: null }));

    try {
      await service.execute({ email: 'x@x.com', password: 'p' });
      fail('should have thrown');
    } catch (e) {
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.ACCOUNT_NOT_ACTIVATED,
      );
    }
  });

  it('senha incorreta → INVALID_CREDENTIALS', async () => {
    userFindUnique.mockResolvedValue(buildUserRow());
    bcryptCompare.mockResolvedValue(false);

    try {
      await service.execute({ email: 'x@x.com', password: 'wrong' });
      fail('should have thrown');
    } catch (e) {
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.INVALID_CREDENTIALS,
      );
    }
  });

  it('emailVerified=false → ACCOUNT_NOT_VERIFIED', async () => {
    userFindUnique.mockResolvedValue(buildUserRow({ emailVerified: false }));

    try {
      await service.execute({ email: 'x@x.com', password: 'p' });
      fail('should have thrown');
    } catch (e) {
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.ACCOUNT_NOT_VERIFIED,
      );
    }
  });

  it('atualiza lastLoginAt (não bloqueia a resposta)', async () => {
    userFindUnique.mockResolvedValue(buildUserRow());

    await service.execute({ email: 'u@x', password: 'p' });

    expect(userUpdate).toHaveBeenCalledTimes(1);
    const updateCalls = userUpdate.mock.calls as Array<
      [{ where: { id: string }; data: { lastLoginAt: Date } }]
    >;
    const updateArg = updateCalls[0][0];
    expect(updateArg.where).toEqual({ id: 'user-1' });
    expect(updateArg.data.lastLoginAt).toBeInstanceOf(Date);
  });
});
