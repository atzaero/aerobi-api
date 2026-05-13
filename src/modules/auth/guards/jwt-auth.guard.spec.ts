import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';

import { JwtAuthGuard } from './jwt-auth.guard';

function buildContext(): ExecutionContext {
  return {
    getHandler: () => undefined,
    getClass: () => undefined,
    switchToHttp: () => ({ getRequest: () => ({}) }),
  } as unknown as ExecutionContext;
}

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: Reflector;
  const errorMessages = new ErrorMessageService();

  beforeEach(() => {
    reflector = new Reflector();
    guard = new JwtAuthGuard(reflector, errorMessages);
  });

  it('bypassa quando rota tem @Public()', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);
    expect(guard.canActivate(buildContext())).toBe(true);
  });

  describe('handleRequest', () => {
    it('retorna user quando autenticado', () => {
      const user = { id: 'u', email: 'e@e', role: 'OPERATOR' as never };
      expect(guard.handleRequest<typeof user>(null, user, null)).toBe(user);
    });

    it('lança UNAUTHORIZED quando user=false', () => {
      try {
        guard.handleRequest(null, false, 'no jwt');
        fail('should have thrown');
      } catch (e) {
        expect((e as CustomHttpException).getErrorCode()).toBe(
          ErrorCode.UNAUTHORIZED,
        );
      }
    });

    it('lança UNAUTHORIZED quando há erro', () => {
      try {
        guard.handleRequest(new Error('boom'), false, null);
        fail('should have thrown');
      } catch (e) {
        expect((e as CustomHttpException).getErrorCode()).toBe(
          ErrorCode.UNAUTHORIZED,
        );
      }
    });
  });
});
