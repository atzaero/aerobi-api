import type { UserRole } from '@/generated/prisma/client';

import type {
  DashboardMetaDTO,
  DashboardScopeKind,
} from '../dtos/dashboard-response.dto';
import type { DashboardRange } from '../utils/date-range.util';

/**
 * Projeta o `meta` da resposta (papel do ator + recorte de escopo + faixa de
 * tempo resolvida). O `range` é exposto em ms epoch (paridade com o web).
 */
export function buildDashboardMeta(
  role: UserRole,
  scopeKind: DashboardScopeKind,
  range: DashboardRange,
): DashboardMetaDTO {
  return {
    role,
    scopeKind,
    range: { from: range.fromMs, to: range.toMs, preset: range.preset },
  };
}
