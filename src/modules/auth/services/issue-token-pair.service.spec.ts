import { UserRole } from '@/generated/prisma/client';

import type { IRefreshTokenRepository } from '../repositories/refresh-token.repository.interface';
import { hashRefreshToken } from '../utils/refresh-token-hash.util';

import { IssueTokenPairService } from './issue-token-pair.service';
import { JwtSignerService } from './jwt-signer.service';

describe('IssueTokenPairService', () => {
  let service: IssueTokenPairService;
  let signAccess: jest.Mock;
  let signRefresh: jest.Mock;
  let create: jest.Mock;

  const subject = {
    id: 'user-1',
    email: 'u@x',
    role: UserRole.OPERATOR,
  };

  beforeEach(() => {
    signAccess = jest.fn().mockReturnValue({
      token: 'access.jwt',
      expiresAt: new Date(Date.now() + 60_000),
      jti: 'access-jti',
    });
    signRefresh = jest.fn().mockReturnValue({
      token: 'refresh.jwt',
      expiresAt: new Date(Date.now() + 86400_000),
      jti: 'refresh-jti',
    });
    create = jest.fn().mockResolvedValue({ id: 'rt-1' });

    const signer = {
      signAccess,
      signRefresh,
    } as unknown as JwtSignerService;
    const repo = {
      create,
      findByJti: jest.fn(),
      rotate: jest.fn(),
      revokeById: jest.fn(),
      revokeAllForUser: jest.fn(),
    } as unknown as IRefreshTokenRepository;

    service = new IssueTokenPairService(signer, repo);
  });

  it('emite par e persiste refresh com hash + jti', async () => {
    const result = await service.execute(subject, {
      userAgent: 'jest',
      ipAddress: '127.0.0.1',
    });

    expect(signAccess).toHaveBeenCalledWith(subject);
    expect(signRefresh).toHaveBeenCalledWith(subject);
    expect(create).toHaveBeenCalledTimes(1);
    const createCalls = create.mock.calls as Array<
      [
        {
          jti: string;
          tokenHash: string;
          userId: string;
          userAgent?: string;
          ipAddress?: string;
        },
      ]
    >;
    const arg = createCalls[0][0];
    expect(arg.jti).toBe('refresh-jti');
    expect(arg.tokenHash).toBe(hashRefreshToken('refresh.jwt'));
    expect(arg.userId).toBe('user-1');
    expect(arg.userAgent).toBe('jest');
    expect(arg.ipAddress).toBe('127.0.0.1');
    expect(result.accessToken).toBe('access.jwt');
    expect(result.refreshToken).toBe('refresh.jwt');
    expect(result.refreshTokenId).toBe('rt-1');
  });

  it('aceita execução sem SessionContext', async () => {
    const result = await service.execute(subject);
    expect(create).toHaveBeenCalledTimes(1);
    const createCalls = create.mock.calls as Array<
      [{ userAgent?: string; ipAddress?: string }]
    >;
    expect(createCalls[0][0].userAgent).toBeUndefined();
    expect(createCalls[0][0].ipAddress).toBeUndefined();
    expect(result.refreshTokenId).toBe('rt-1');
  });
});
