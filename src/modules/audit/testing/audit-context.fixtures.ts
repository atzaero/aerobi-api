import { UserRole } from '@/generated/prisma/client';

import type { RecordAuditContext } from '../services/audit-recorder.service';

/**
 * Fixture de `RecordAuditContext` (ator + ip/userAgent) para specs de services
 * instrumentados com auditoria. Mesmo shape que `buildAuditContext` monta em
 * runtime; sobrescreva o necessário por caso.
 */
export function buildAuditContextFixture(
  overrides: Partial<RecordAuditContext> = {},
): RecordAuditContext {
  return {
    actorId: 'actor-1',
    actorEmail: 'actor@aerobi.local',
    actorRole: UserRole.ADMIN,
    ...overrides,
  };
}
