import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { UserRole } from '@/generated/prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

import type { RefreshTokenRepository } from '../repositories/refresh-token.repository';
import { hashRefreshToken } from '../utils/refresh-token-hash.util';

import { AuthRefreshSessionService } from './auth-refresh-session.service';
import { JwtVerifierService } from './jwt-verifier.service';
import { RotateTokenPairService } from './rotate-token-pair.service';

const REFRESH_PLAIN = 'plain.refresh.jwt';
const REFRESH_HASH = hashRefreshToken(REFRESH_PLAIN);

function buildRefreshRecord(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'rt-1',
    jti: 'jti-1',
    tokenHash: REFRESH_HASH,
    userId: 'user-1',
    expiresAt: new Date(Date.now() + 60 * 60_000),
    revoked: false,
    deletedAt: null,
    ...overrides,
  };
}

function buildUserRow(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'user-1',
    email: 'user@aerobi.local',
    name: 'User',
    role: UserRole.OPERATOR,
    deletedAt: null,
    ...overrides,
  };
}

describe('AuthRefreshSessionService', () => {
  let service: AuthRefreshSessionService;

  let verifyRefreshToken: jest.Mock;
  let rotateExecute: jest.Mock;
  let userFindUnique: jest.Mock;
  let findByJti: jest.Mock;
  let create: jest.Mock;
  let rotate: jest.Mock;
  let revokeById: jest.Mock;
  let revokeAllForUser: jest.Mock;

  beforeEach(() => {
    verifyRefreshToken = jest.fn();
    rotateExecute = jest.fn();
    userFindUnique = jest.fn();

    findByJti = jest.fn();
    create = jest.fn();
    rotate = jest.fn();
    revokeById = jest.fn();
    revokeAllForUser = jest.fn();

    const jwtVerifier = { verifyRefreshToken } as unknown as JwtVerifierService;
    const rotateTokenPair = {
      execute: rotateExecute,
    } as unknown as RotateTokenPairService;
    const prisma = {
      user: { findUnique: userFindUnique },
    } as unknown as PrismaService;
    const refreshTokenRepository = {
      create,
      findByJti,
      rotate,
      revokeById,
      revokeAllForUser,
    } as unknown as RefreshTokenRepository;

    service = new AuthRefreshSessionService(
      jwtVerifier,
      rotateTokenPair,
      prisma,
      new ErrorMessageService(),
      refreshTokenRepository,
    );
  });

  it('rotação bem-sucedida retorna par novo', async () => {
    verifyRefreshToken.mockReturnValue({
      sub: 'user-1',
      email: 'u@x',
      role: UserRole.OPERATOR,
      typ: 'refresh',
      jti: 'jti-1',
    });
    findByJti.mockResolvedValue(buildRefreshRecord());
    userFindUnique.mockResolvedValue(buildUserRow());
    rotateExecute.mockResolvedValue({
      accessToken: 'a2',
      refreshToken: 'r2',
      accessExpiresAt: new Date(),
      refreshExpiresAt: new Date(),
      refreshTokenId: 'rt-2',
    });

    const result = await service.execute({ refreshToken: REFRESH_PLAIN });

    expect(findByJti).toHaveBeenCalledWith('jti-1');
    expect(rotateExecute).toHaveBeenCalledWith(
      'rt-1',
      expect.objectContaining({ id: 'user-1' }),
      undefined,
    );
    expect(result.accessToken).toBe('a2');
  });

  it('jti inexistente → REFRESH_TOKEN_INVALID', async () => {
    verifyRefreshToken.mockReturnValue({
      sub: 'user-1',
      email: 'u@x',
      role: UserRole.OPERATOR,
      typ: 'refresh',
      jti: 'jti-unknown',
    });
    findByJti.mockResolvedValue(null);

    try {
      await service.execute({ refreshToken: REFRESH_PLAIN });
      fail('should have thrown');
    } catch (e) {
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.REFRESH_TOKEN_INVALID,
      );
    }
  });

  it('hash mismatch → REFRESH_TOKEN_INVALID', async () => {
    verifyRefreshToken.mockReturnValue({
      sub: 'user-1',
      email: 'u@x',
      role: UserRole.OPERATOR,
      typ: 'refresh',
      jti: 'jti-1',
    });
    findByJti.mockResolvedValue(
      buildRefreshRecord({ tokenHash: 'hash-de-outro-token' }),
    );

    try {
      await service.execute({ refreshToken: REFRESH_PLAIN });
      fail('should have thrown');
    } catch (e) {
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.REFRESH_TOKEN_INVALID,
      );
    }
  });

  it('refresh já revogado → REUSE DETECTED + revoga toda a família', async () => {
    verifyRefreshToken.mockReturnValue({
      sub: 'user-1',
      email: 'u@x',
      role: UserRole.OPERATOR,
      typ: 'refresh',
      jti: 'jti-1',
    });
    findByJti.mockResolvedValue(buildRefreshRecord({ revoked: true }));
    revokeAllForUser.mockResolvedValue(3);

    try {
      await service.execute({ refreshToken: REFRESH_PLAIN });
      fail('should have thrown');
    } catch (e) {
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.REFRESH_TOKEN_REUSE_DETECTED,
      );
    }
    expect(revokeAllForUser).toHaveBeenCalledWith('user-1');
  });

  it('refresh expirado → REFRESH_TOKEN_EXPIRED', async () => {
    verifyRefreshToken.mockReturnValue({
      sub: 'user-1',
      email: 'u@x',
      role: UserRole.OPERATOR,
      typ: 'refresh',
      jti: 'jti-1',
    });
    findByJti.mockResolvedValue(
      buildRefreshRecord({ expiresAt: new Date(Date.now() - 1000) }),
    );

    try {
      await service.execute({ refreshToken: REFRESH_PLAIN });
      fail('should have thrown');
    } catch (e) {
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.REFRESH_TOKEN_EXPIRED,
      );
    }
  });

  it('usuário soft-deleted → REFRESH_TOKEN_INVALID', async () => {
    verifyRefreshToken.mockReturnValue({
      sub: 'user-1',
      email: 'u@x',
      role: UserRole.OPERATOR,
      typ: 'refresh',
      jti: 'jti-1',
    });
    findByJti.mockResolvedValue(buildRefreshRecord());
    userFindUnique.mockResolvedValue(buildUserRow({ deletedAt: new Date() }));

    try {
      await service.execute({ refreshToken: REFRESH_PLAIN });
      fail('should have thrown');
    } catch (e) {
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.REFRESH_TOKEN_INVALID,
      );
    }
  });
});
