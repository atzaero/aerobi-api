import type { AuditLog } from '@/generated/prisma/client';

import type { AuditLogResponseDto } from '../dtos/audit-log-response.dto';

/**
 * Projeta um `AuditLog` do domínio em `AuditLogResponseDto`. Datas viram ISO
 * 8601; JSON e campos de ator nulos são preservados explicitamente.
 */
export function toAuditLogResponse(log: AuditLog): AuditLogResponseDto {
  return {
    id: log.id,
    actorId: log.actorId ?? null,
    actorEmail: log.actorEmail ?? null,
    actorRole: log.actorRole ?? null,
    action: log.action,
    entityType: log.entityType,
    entityId: log.entityId,
    before: log.before ?? null,
    after: log.after ?? null,
    metadata: log.metadata ?? null,
    ipAddress: log.ipAddress ?? null,
    userAgent: log.userAgent ?? null,
    createdAt: log.createdAt.toISOString(),
  };
}
