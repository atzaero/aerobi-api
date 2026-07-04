import type { LandingRequest } from '@/generated/prisma/client';

/**
 * Recorte estável de uma solicitação de pouso para os snapshots `before`/`after`
 * da auditoria. Projeta só identificadores/estado — **nunca** PII (CPF, nome,
 * e-mail, telefone) nem dados voláteis — mantendo a trilha append-only enxuta.
 */
export function landingRequestAuditSnapshot(request: LandingRequest): {
  id: string;
  aerodromeId: string;
  status: LandingRequest['status'];
  icao: string | null;
  uf: LandingRequest['uf'];
  aircraftRegistration: string | null;
} {
  return {
    id: request.id,
    aerodromeId: request.aerodromeId,
    status: request.status,
    icao: request.icao,
    uf: request.uf,
    aircraftRegistration: request.aircraftRegistration,
  };
}
