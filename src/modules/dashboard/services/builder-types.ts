import type { UserRole } from '@/generated/prisma/client';

import type { DashboardResponseDTO } from '../dtos/dashboard-response.dto';
import type { DashboardScope } from '../utils/dashboard-scope.util';
import type { DashboardRange } from '../utils/date-range.util';

/**
 * Contexto passado a cada builder: papel do ator + escopo já resolvido
 * (materializado em ids) + faixa de tempo. Os builders não conhecem o token nem
 * o payload — recebem tudo pronto.
 */
export interface DashboardBuildContext {
  role: UserRole;
  scope: DashboardScope;
  range: DashboardRange;
}

/** Assinatura comum dos builders por papel. */
export type DashboardBuilder = (
  ctx: DashboardBuildContext,
) => Promise<DashboardResponseDTO>;
