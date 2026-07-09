import { UserRole } from '@/generated/prisma/client';

import type { DashboardBuilder } from './builder-types';

/** Builders por papel, injetados pelo `GetDashboardService`. */
export interface DashboardBuilders {
  admin: DashboardBuilder;
  operator: DashboardBuilder;
  technical: DashboardBuilder;
}

/**
 * Mapeia o papel do ator ao builder correspondente (admin e coordinator
 * partilham `admin` — diferem só no escopo resolvido). Papel sem builder →
 * `null` (deny-by-default; o service traduz em 403). Espelha o `DASHBOARD_BUILDERS`
 * do `aerobi-web`.
 */
export function resolveDashboardBuilder(
  role: UserRole,
  builders: DashboardBuilders,
): DashboardBuilder | null {
  switch (role) {
    case UserRole.ADMIN:
    case UserRole.COORDINATOR:
      return builders.admin;
    case UserRole.OPERATOR:
      return builders.operator;
    case UserRole.TECHNICAL:
      return builders.technical;
    default:
      return null;
  }
}
