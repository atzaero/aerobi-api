import type { TechnicalVisit } from '@/generated/prisma/client';

/** Snapshot mínimo de visita técnica para o audit log (sem segredos/URLs). */
export function technicalVisitAuditSnapshot(visit: TechnicalVisit) {
  return {
    id: visit.id,
    aerodromeId: visit.aerodromeId,
    visitorName: visit.visitorName,
    city: visit.city,
    visitAt: visit.visitAt.toISOString(),
  };
}
