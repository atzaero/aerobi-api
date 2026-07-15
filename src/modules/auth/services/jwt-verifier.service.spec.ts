import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { UserRole } from '@/generated/prisma/client';

import { JwtVerifierService } from './jwt-verifier.service';

function b64(s: string): string {
  return Buffer.from(s, 'utf-8').toString('base64');
}

describe('JwtVerifierService', () => {
  let verifier: JwtVerifierService;
  let verify: jest.Mock;

  beforeEach(() => {
    const config = new ConfigService({
      JWT_SECRET_PUBLIC_KEY: b64('dummy-public'),
    });

    verify = jest.fn();

    const jwtService = { verify } as unknown as JwtService;
    verifier = new JwtVerifierService(
      config,
      jwtService,
      new ErrorMessageService(),
    );
  });

  it('retorna o payload em sucesso', () => {
    const payload = {
      sub: 'u',
      email: 'u@x',
      role: UserRole.OPERATOR,
      typ: 'refresh' as const,
      jti: 'j',
    };
    verify.mockReturnValue(payload);

    expect(verifier.verifyRefreshToken('plain')).toEqual(payload);
  });

  it('mapeia TokenExpiredError → REFRESH_TOKEN_EXPIRED', () => {
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
      verifier.verifyRefreshToken('plain');
      fail('should have thrown');
    } catch (e) {
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.REFRESH_TOKEN_EXPIRED,
      );
    }
  });

  it('mapeia erro genérico → REFRESH_TOKEN_INVALID', () => {
    verify.mockImplementation(() => {
      throw new Error('bad sig');
    });

    try {
      verifier.verifyRefreshToken('plain');
      fail('should have thrown');
    } catch (e) {
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.REFRESH_TOKEN_INVALID,
      );
    }
  });

  it('rejeita typ !== refresh com REFRESH_TOKEN_INVALID', () => {
    verify.mockReturnValue({
      sub: 'u',
      email: 'u@x',
      role: UserRole.OPERATOR,
      typ: 'access',
      jti: 'j',
    });

    try {
      verifier.verifyRefreshToken('plain');
      fail('should have thrown');
    } catch (e) {
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.REFRESH_TOKEN_INVALID,
      );
    }
  });
});
