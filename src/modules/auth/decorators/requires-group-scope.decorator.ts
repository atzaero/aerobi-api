import { applyDecorators, SetMetadata } from '@nestjs/common';

import {
  GROUP_SCOPE_KEY,
  GROUP_SCOPE_PARAM_KEY,
} from '../constants/auth.constants';
import { GroupScopeSubject } from '../guards/group-scope.subject';

/**
 * Exige que o recurso identificado por `request.params[param]`, `query[param]` ou
 * `body[param]` pertença ao mesmo grupo (`groupId`) do usuário autenticado.
 * Avaliado pelo `GroupScopeGuard` (ordem: params → query → body).
 *
 * @param param Nome do parâmetro com o UUID do recurso (default `id`).
 */
export const RequiresGroupScope = (subject: GroupScopeSubject, param = 'id') =>
  applyDecorators(
    SetMetadata(GROUP_SCOPE_KEY, subject),
    SetMetadata(GROUP_SCOPE_PARAM_KEY, param),
  );
