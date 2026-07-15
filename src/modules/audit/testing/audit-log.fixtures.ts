import { AuditAction, UserRole } from '@/generated/prisma/client';
import type { AuditLog } from '@/generated/prisma/client';

/**
 * Fábrica de `AuditLog` para specs. Defaults representam um CREATE de usuário
 * por um ADMIN; sobrescreva o necessário por caso.
 */
export function buildAuditLogFixture(
  overrides: Partial<AuditLog> = {},
): AuditLog {
  return {
    id: 'audit-1',
    actorId: 'user-1',
    actorEmail: 'admin@aerobi.com.br',
    actorRole: UserRole.ADMIN,
    action: AuditAction.CREATE,
    entityType: 'user',
    entityId: 'target-1',
    before: null,
    after: { name: 'Fulano' },
    metadata: null,
    ipAddress: '127.0.0.1',
    userAgent: 'jest',
    createdAt: new Date('2026-07-03T12:00:00.000Z'),
    ...overrides,
  };
}
