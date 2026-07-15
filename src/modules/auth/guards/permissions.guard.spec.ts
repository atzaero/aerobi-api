import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { UserRole } from '@/generated/prisma/client';

import type { RequiredPermission } from '../decorators/require-permission.decorator';
import { PermissionsGuard } from './permissions.guard';

function buildContext(
  user: { id: string; email: string; role: UserRole } | undefined,
): ExecutionContext {
  return {
    getHandler: () => undefined,
    getClass: () => undefined,
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  } as unknown as ExecutionContext;
}

describe('PermissionsGuard', () => {
  let guard: PermissionsGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new PermissionsGuard(reflector, new ErrorMessageService());
  });

  it('passa quando a rota não declara @RequirePermission', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    expect(
      guard.canActivate(
        buildContext({ id: 'u', email: 'e@e', role: UserRole.TECHNICAL }),
      ),
    ).toBe(true);
  });

  it('passa quando a role pode executar a ação no subject', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue({
      subject: 'aerodrome',
      action: 'update',
    } satisfies RequiredPermission);
    expect(
      guard.canActivate(
        buildContext({ id: 'u', email: 'e@e', role: UserRole.COORDINATOR }),
      ),
    ).toBe(true);
  });

  it('lança FORBIDDEN quando a role não pode a ação', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue({
      subject: 'aerodrome',
      action: 'update',
    } satisfies RequiredPermission);

    try {
      guard.canActivate(
        buildContext({ id: 'u', email: 'e@e', role: UserRole.OPERATOR }),
      );
      fail('should have thrown');
    } catch (e) {
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.FORBIDDEN,
      );
    }
  });

  it('lança UNAUTHORIZED quando request.user está ausente', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue({
      subject: 'aerodrome',
      action: 'update',
    } satisfies RequiredPermission);

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
