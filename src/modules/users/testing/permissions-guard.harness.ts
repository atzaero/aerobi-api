import type { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { PERMISSION_KEY } from '@/modules/auth/constants/auth.constants';
import type { RequiredPermission } from '@/modules/auth/decorators/require-permission.decorator';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import type { UserRole } from '@/generated/prisma/client';

/**
 * Harness de teste para a autorização declarada num controller via
 * `@RequirePermission`. Lê a metadata **real** do handler e executa o
 * `PermissionsGuard` **real** contra a matriz `PERMISSIONS`, para que os
 * specs de controller cubram "autorizado (2xx) / negado (403)" sem subir o
 * Nest inteiro nem duplicar a lógica do guard.
 */
type Handler = (...args: never[]) => unknown;

/**
 * Construtor de controller cujo `prototype` é indexável por nome de método.
 * O acesso **computado** ao handler (`prototype[method]`) é resolvido aqui
 * dentro de propósito — evita que os specs refiram `Controller.prototype.handle`
 * diretamente (que dispararia `@typescript-eslint/unbound-method`).
 */
interface ControllerClass {
  new (...args: never[]): object;
  prototype: Record<string, Handler>;
}

const reflector = new Reflector();
const guard = new PermissionsGuard(reflector, new ErrorMessageService());

/** Lê o `@RequirePermission` efetivamente aplicado ao handler do controller. */
export function readRequiredPermission(
  controllerClass: ControllerClass,
  method: string,
): RequiredPermission | undefined {
  return reflector.get<RequiredPermission>(
    PERMISSION_KEY,
    controllerClass.prototype[method],
  );
}

/**
 * Executa o `PermissionsGuard` real contra a metadata do handler para um dado
 * papel. Devolve `true` quando autoriza; relança a `CustomHttpException`
 * (403/401) quando nega — para o spec assertar o `ErrorCode`. `role`
 * `undefined` simula token sem usuário (→ 401).
 */
export function runPermissionsGuard(
  controllerClass: ControllerClass,
  method: string,
  role: UserRole | undefined,
): boolean {
  const handler = controllerClass.prototype[method];
  const context = {
    getHandler: () => handler,
    getClass: () => controllerClass,
    switchToHttp: () => ({
      getRequest: () => ({
        user: role ? { id: 'u-1', email: 'u@x', role } : undefined,
      }),
    }),
  } as unknown as ExecutionContext;

  return guard.canActivate(context);
}
