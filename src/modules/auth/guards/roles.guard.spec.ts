import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { UserRole } from '@/generated/prisma/client';

import { RolesGuard } from './roles.guard';

function buildContext(
  user: { id: string; email: string; role: UserRole } | undefined,
): ExecutionContext {
  return {
    getHandler: () => undefined,
    getClass: () => undefined,
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector, new ErrorMessageService());
  });

  it('passa quando nenhuma role é exigida', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    expect(
      guard.canActivate(
        buildContext({
          id: 'u',
          email: 'e@e',
          role: UserRole.OPERATOR,
        }),
      ),
    ).toBe(true);
  });

  it('passa quando role do usuário está na lista', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([UserRole.ADMIN, UserRole.COORDINATOR]);
    expect(
      guard.canActivate(
        buildContext({
          id: 'u',
          email: 'e@e',
          role: UserRole.COORDINATOR,
        }),
      ),
    ).toBe(true);
  });

  it('lança FORBIDDEN quando role não bate', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([UserRole.ADMIN]);

    try {
      guard.canActivate(
        buildContext({
          id: 'u',
          email: 'e@e',
          role: UserRole.OPERATOR,
        }),
      );
      fail('should have thrown');
    } catch (e) {
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.FORBIDDEN,
      );
    }
  });

  it('lança UNAUTHORIZED quando request.user está ausente', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([UserRole.ADMIN]);

    try {
      guard.canActivate(buildContext(undefined));
      fail('should have thrown');
    } catch (e) {
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.UNAUTHORIZED,
      );
    }
  });
});
