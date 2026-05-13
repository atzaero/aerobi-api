import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { UserRole } from '@/generated/prisma/client';

import { JwtSignerService } from './jwt-signer.service';

function b64(s: string): string {
  return Buffer.from(s, 'utf-8').toString('base64');
}

describe('JwtSignerService', () => {
  let signer: JwtSignerService;
  let sign: jest.Mock;
  let decode: jest.Mock;

  const subject = {
    id: 'user-1',
    email: 'user@aerobi.local',
    role: UserRole.OPERATOR,
  };

  beforeEach(() => {
    const config = new ConfigService({
      JWT_SECRET_PRIVATE_KEY: b64('dummy-private'),
      JWT_ACCESS_TTL: '15m',
      JWT_REFRESH_TTL: '7d',
    });

    sign = jest.fn();
    decode = jest.fn();

    const jwtService = { sign, decode } as unknown as JwtService;

    signer = new JwtSignerService(
      config,
      jwtService,
      new ErrorMessageService(),
    );
  });

  it('signAccess gera SignedToken com typ=access', () => {
    sign.mockReturnValue('signed.access');
    const exp = Math.floor(Date.now() / 1000) + 900;
    decode.mockReturnValue({ exp });

    const result = signer.signAccess(subject);

    const signCalls = sign.mock.calls as Array<
      [{ sub: string; typ: string; jti: string }, { algorithm: string }]
    >;
    expect(signCalls[0][0].sub).toBe('user-1');
    expect(signCalls[0][0].typ).toBe('access');
    expect(signCalls[0][0].jti).toMatch(/^[0-9a-f-]{36}$/);
    expect(signCalls[0][1].algorithm).toBe('RS256');
    expect(result.token).toBe('signed.access');
    expect(result.expiresAt).toBeInstanceOf(Date);
    expect(result.jti).toBe(signCalls[0][0].jti);
  });

  it('signRefresh gera SignedToken com typ=refresh', () => {
    sign.mockReturnValue('signed.refresh');
    const exp = Math.floor(Date.now() / 1000) + 86400 * 7;
    decode.mockReturnValue({ exp });

    const result = signer.signRefresh(subject);

    const signCalls = sign.mock.calls as Array<
      [{ typ: string; jti: string }, unknown]
    >;
    expect(signCalls[0][0].typ).toBe('refresh');
    expect(result.token).toBe('signed.refresh');
    expect(result.jti).toBeDefined();
  });

  it('gera jti diferente a cada chamada', () => {
    sign.mockReturnValue('t');
    decode.mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 60 });

    const a = signer.signAccess(subject);
    const b = signer.signAccess(subject);
    expect(a.jti).not.toBe(b.jti);
  });

  it('lança INTERNAL_ERROR se o decode não tiver claim exp', () => {
    sign.mockReturnValue('weird.token');
    decode.mockReturnValue(null);

    try {
      signer.signAccess(subject);
      fail('should have thrown');
    } catch (e) {
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.INTERNAL_ERROR,
      );
    }
  });
});
