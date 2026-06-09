import { SetMetadata } from '@nestjs/common';

import { PERMISSION_KEY } from '../constants/auth.constants';
import type { AuthzAction, AuthzSubject } from '../permissions';

/**
 * Par `{ subject, action }` gravado como metadata por
 * `@RequirePermission(...)` e lido pelo `PermissionsGuard`.
 */
export interface RequiredPermission {
  subject: AuthzSubject;
  action: AuthzAction;
}

/**
 * Exige que o usuário autenticado possa executar `action` sobre `subject`
 * segundo a matriz `PERMISSIONS` (`can()`). Avaliado pelo `PermissionsGuard`
 * após o `JwtAuthGuard`.
 *
 * @example
 * ```ts
 * @UseGuards(JwtAuthGuard, PermissionsGuard)
 * @RequirePermission('aerodrome', 'update')
 * @Patch(':id')
 * update() { ... }
 * ```
 */
export const RequirePermission = (subject: AuthzSubject, action: AuthzAction) =>
  SetMetadata<string, RequiredPermission>(PERMISSION_KEY, { subject, action });
