import { SetMetadata } from '@nestjs/common';

import { GROUP_SCOPE_KEY } from '../constants/auth.constants';
import { GroupScopeSubject } from '../guards/group-scope.subject';

/**
 * Exige que o recurso identificado por `request.params.id` pertença ao mesmo
 * grupo (`aerodromeGroupId`) do usuário autenticado. Avaliado pelo
 * `GroupScopeGuard`, que deve rodar **após** o `JwtAuthGuard` (popula
 * `request.user`) e o `RolesGuard`.
 *
 * `subject` indica de que recurso o `groupId` será resolvido. ADMIN ignora a
 * checagem.
 *
 * @example
 * ```ts
 * @UseGuards(JwtAuthGuard, RolesGuard, GroupScopeGuard)
 * @RequiresGroupScope(GroupScopeSubject.OPERATIONAL_AERODROME)
 * @Patch(':id')
 * update(@Param('id') id: string) { ... }
 * ```
 */
export const RequiresGroupScope = (subject: GroupScopeSubject) =>
  SetMetadata(GROUP_SCOPE_KEY, subject);
