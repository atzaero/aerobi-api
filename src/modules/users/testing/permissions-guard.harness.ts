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
type ControllerCtor<T> = new (...args: never[]) => T;

const reflector = new Reflector();
const guard = new PermissionsGuard(reflector, new ErrorMessageService());

/**
 * Resolve o handler do controller por nome de método. O acesso **computado**
 * (`prototype[method]`) é isolado aqui com um único cast deliberado — evita que
 * os specs refiram `Controller.prototype.handle` (que dispararia
 * `@typescript-eslint/unbound-method`).
 */
function resolveHandler<T>(
  controllerClass: ControllerCtor<T>,
  method: keyof T & string,
): Handler {
  return (controllerClass.prototype as Record<string, Handler>)[method];
}

/**
 * Lê o `@RequirePermission` efetivamente aplicado ao handler do controller.
 * Usa `getAllAndOverride([handler, class])` — **a mesma** resolução do
 * `PermissionsGuard` — para enxergar tanto a metadata no método quanto no nível
 * de classe.
 */
export function readRequiredPermission<T>(
  controllerClass: ControllerCtor<T>,
  method: keyof T & string,
): RequiredPermission | undefined {
  return reflector.getAllAndOverride<RequiredPermission>(PERMISSION_KEY, [
    resolveHandler(controllerClass, method),
    controllerClass,
  ]);
}

/**
 * Executa o `PermissionsGuard` real contra a metadata do handler para um dado
 * papel. Devolve `true` quando autoriza; relança a `CustomHttpException`
 * (403/401) quando nega — para o spec assertar o `ErrorCode`. `role`
 * `undefined` simula token sem usuário (→ 401).
 */
export function runPermissionsGuard<T>(
  controllerClass: ControllerCtor<T>,
  method: keyof T & string,
  role: UserRole | undefined,
): boolean {
  const handler = resolveHandler(controllerClass, method);
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
