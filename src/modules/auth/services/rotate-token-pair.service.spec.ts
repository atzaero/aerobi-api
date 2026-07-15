import { UserRole } from '@/generated/prisma/client';

import type { RefreshTokenRepository } from '../repositories/refresh-token.repository';
import { hashRefreshToken } from '../utils/refresh-token-hash.util';

import { JwtSignerService } from './jwt-signer.service';
import { RotateTokenPairService } from './rotate-token-pair.service';

describe('RotateTokenPairService', () => {
  let service: RotateTokenPairService;
  let signAccess: jest.Mock;
  let signRefresh: jest.Mock;
  let rotate: jest.Mock;

  const subject = {
    id: 'user-1',
    email: 'u@x',
    role: UserRole.OPERATOR,
  };

  beforeEach(() => {
    signAccess = jest.fn().mockReturnValue({
      token: 'access.new',
      expiresAt: new Date(),
      jti: 'a-jti',
    });
    signRefresh = jest.fn().mockReturnValue({
      token: 'refresh.new',
      expiresAt: new Date(),
      jti: 'r-jti',
    });
    rotate = jest.fn().mockResolvedValue({ id: 'rt-2' });

    const signer = {
      signAccess,
      signRefresh,
    } as unknown as JwtSignerService;
    const repo = {
      create: jest.fn(),
      findByJti: jest.fn(),
      rotate,
      revokeById: jest.fn(),
      revokeAllForUser: jest.fn(),
    } as unknown as RefreshTokenRepository;

    service = new RotateTokenPairService(signer, repo);
  });

  it('rotaciona via repo.rotate com hash + jti do novo refresh', async () => {
    const result = await service.execute('rt-1', subject, {
      userAgent: 'ua',
      ipAddress: '1.1.1.1',
    });

    expect(rotate).toHaveBeenCalledTimes(1);
    const rotateCalls = rotate.mock.calls as Array<
      [
        {
          currentId: string;
          newToken: {
            jti: string;
            tokenHash: string;
            userId: string;
            userAgent?: string;
            ipAddress?: string;
          };
        },
      ]
    >;
    const arg = rotateCalls[0][0];
    expect(arg.currentId).toBe('rt-1');
    expect(arg.newToken.jti).toBe('r-jti');
    expect(arg.newToken.tokenHash).toBe(hashRefreshToken('refresh.new'));
    expect(arg.newToken.userId).toBe('user-1');
    expect(arg.newToken.userAgent).toBe('ua');
    expect(arg.newToken.ipAddress).toBe('1.1.1.1');
    expect(result.refreshTokenId).toBe('rt-2');
    expect(result.accessToken).toBe('access.new');
  });
});
