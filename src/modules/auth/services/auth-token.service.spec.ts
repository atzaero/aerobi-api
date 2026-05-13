import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { UserRole } from '@/generated/prisma/client';

import type { IRefreshTokenRepository } from '../repositories/refresh-token.repository.interface';

import { AuthTokenService } from './auth-token.service';

function b64(str: string): string {
  return Buffer.from(str, 'utf-8').toString('base64');
}

describe('AuthTokenService', () => {
  let service: AuthTokenService;

  let sign: jest.Mock;
  let verify: jest.Mock;
  let decode: jest.Mock;

  let create: jest.Mock;
  let findByJti: jest.Mock;
  let rotate: jest.Mock;
  let revokeById: jest.Mock;
  let revokeAllForUser: jest.Mock;

  const subject = {
    id: 'user-1',
    email: 'user@aerobi.local',
    role: UserRole.OPERATOR,
  };

  beforeEach(() => {
    const config = new ConfigService({
      JWT_SECRET_PRIVATE_KEY: b64('dummy-private'),
      JWT_SECRET_PUBLIC_KEY: b64('dummy-public'),
      JWT_ACCESS_TTL: '15m',
      JWT_REFRESH_TTL: '7d',
    });

    sign = jest.fn();
    verify = jest.fn();
    decode = jest.fn();

    create = jest.fn();
    findByJti = jest.fn();
    rotate = jest.fn();
    revokeById = jest.fn();
    revokeAllForUser = jest.fn();

    const jwtService = { sign, verify, decode } as unknown as JwtService;
    const refreshTokenRepository = {
      create,
      findByJti,
      rotate,
      revokeById,
      revokeAllForUser,
    } as unknown as IRefreshTokenRepository;

    service = new AuthTokenService(
      config,
      jwtService,
      new ErrorMessageService(),
      refreshTokenRepository,
    );
  });

  describe('hashRefresh', () => {
    it('produces deterministic SHA-256 hex (64 chars)', () => {
      const hash = service.hashRefresh('jwt-plain-value');
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
      expect(service.hashRefresh('jwt-plain-value')).toBe(hash);
    });

    it('produces distinct hash for distinct input', () => {
      expect(service.hashRefresh('a')).not.toBe(service.hashRefresh('b'));
    });
  });

  describe('issuePair', () => {
    it('signs access + refresh and persists refresh record', async () => {
      const exp = Math.floor(Date.now() / 1000) + 3600;
      sign.mockReturnValueOnce('access.jwt').mockReturnValueOnce('refresh.jwt');
      decode.mockReturnValue({ exp });
      create.mockResolvedValue({ id: 'rt-1' });

      const result = await service.issuePair(subject, {
        userAgent: 'jest',
        ipAddress: '127.0.0.1',
      });

      expect(sign).toHaveBeenCalledTimes(2);
      expect(create).toHaveBeenCalledTimes(1);
      const createCalls = create.mock.calls as Array<
        [
          {
            userId: string;
            tokenHash: string;
            userAgent?: string;
            ipAddress?: string;
          },
        ]
      >;
      const createArg = createCalls[0][0];
      expect(createArg).toMatchObject({
        userId: 'user-1',
        userAgent: 'jest',
        ipAddress: '127.0.0.1',
      });
      expect(createArg.tokenHash).toMatch(/^[a-f0-9]{64}$/);
      expect(result.accessToken).toBe('access.jwt');
      expect(result.refreshToken).toBe('refresh.jwt');
      expect(result.refreshTokenId).toBe('rt-1');
    });
  });

  describe('rotatePair', () => {
    it('rotates via repository.rotate (atomic)', async () => {
      const exp = Math.floor(Date.now() / 1000) + 3600;
      sign.mockReturnValueOnce('access.new').mockReturnValueOnce('refresh.new');
      decode.mockReturnValue({ exp });
      rotate.mockResolvedValue({ id: 'rt-2' });

      const result = await service.rotatePair('rt-1', subject);

      expect(rotate).toHaveBeenCalledTimes(1);
      const rotateCalls = rotate.mock.calls as Array<
        [{ currentId: string; newToken: { userId: string } }]
      >;
      const rotateArg = rotateCalls[0][0];
      expect(rotateArg.currentId).toBe('rt-1');
      expect(rotateArg.newToken.userId).toBe('user-1');
      expect(result.refreshTokenId).toBe('rt-2');
    });
  });

  describe('verifyRefreshToken', () => {
    it('lança REFRESH_TOKEN_INVALID quando typ não é refresh', () => {
      verify.mockReturnValue({
        sub: 'user-1',
        email: 'u@x',
        role: UserRole.OPERATOR,
        typ: 'access',
        jti: 'jti-1',
      });

      try {
        service.verifyRefreshToken('plain');
        fail('should have thrown');
      } catch (e) {
        expect((e as CustomHttpException).getErrorCode()).toBe(
          ErrorCode.REFRESH_TOKEN_INVALID,
        );
      }
    });

    it('mapeia TokenExpiredError para REFRESH_TOKEN_EXPIRED', () => {
      class TokenExpiredError extends Error {
        constructor() {
          super('expired');
          this.name = 'TokenExpiredError';
        }
      }
      verify.mockImplementation(() => {
        throw new TokenExpiredError();
      });

      try {
        service.verifyRefreshToken('plain');
        fail('should have thrown');
      } catch (e) {
        expect((e as CustomHttpException).getErrorCode()).toBe(
          ErrorCode.REFRESH_TOKEN_EXPIRED,
        );
      }
    });

    it('mapeia outros erros de verify para REFRESH_TOKEN_INVALID', () => {
      verify.mockImplementation(() => {
        throw new Error('bad signature');
      });

      try {
        service.verifyRefreshToken('plain');
        fail('should have thrown');
      } catch (e) {
        expect((e as CustomHttpException).getErrorCode()).toBe(
          ErrorCode.REFRESH_TOKEN_INVALID,
        );
      }
    });

    it('retorna payload em sucesso', () => {
      const payload = {
        sub: 'user-1',
        email: 'u@x',
        role: UserRole.OPERATOR,
        typ: 'refresh',
        jti: 'jti-2',
      };
      verify.mockReturnValue(payload);
      expect(service.verifyRefreshToken('plain')).toEqual(payload);
    });
  });
});
