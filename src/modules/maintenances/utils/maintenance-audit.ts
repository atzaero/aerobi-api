import type { Maintenance } from '@/generated/prisma/client';

/**
 * Recorte estável de uma intervenção para snapshots `before`/`after` da
 * auditoria — sem `securityCode` nem e-mails em claro.
 */
export function maintenanceAuditSnapshot(maintenance: Maintenance): {
  id: string;
  name: string;
  aerodromeId: string;
  authorizedEmailsCount: number;
} {
  return {
    id: maintenance.id,
    name: maintenance.name,
    aerodromeId: maintenance.aerodromeId,
    authorizedEmailsCount: maintenance.authorizedEmails.length,
  };
}
