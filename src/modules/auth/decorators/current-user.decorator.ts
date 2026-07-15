import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import type { AuthenticatedUser } from '../interfaces/authenticated-user.interface';

/**
 * Extrai o `AuthenticatedUser` do request (populado pelo `JwtAuthGuard`
 * via `JwtStrategy.validate`). Retorna `undefined` se a rota não estiver
 * protegida — controllers que dependem disso devem aplicar o guard.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser | undefined => {
    const request = ctx.switchToHttp().getRequest<{
      user?: AuthenticatedUser;
    }>();
    return request.user;
  },
);
