import type { Prisma } from '@/generated/prisma/client';

import type {
  AuditLogFilters,
  CreateAuditLogData,
} from './audit-log.repository.interface';

/**
 * Monta o `where` puro dos filtros de auditoria: igualdade exata em
 * `entityType`/`actorEmail`/`action` e range inclusivo `[from, to]` sobre
 * `createdAt` (espelha `buildAuditQuery` do `aerobi-web`). Filtro ausente
 * (`undefined`) é no-op.
 */
export function buildAuditLogWhere(
  filters: AuditLogFilters,
): Prisma.AuditLogWhereInput {
  const where: Prisma.AuditLogWhereInput = {};

  if (filters.entityType !== undefined) where.entityType = filters.entityType;
  if (filters.actorEmail !== undefined) where.actorEmail = filters.actorEmail;
  if (filters.action !== undefined) where.action = filters.action;

  if (filters.from !== undefined || filters.to !== undefined) {
    where.createdAt = {
      ...(filters.from !== undefined ? { gte: filters.from } : {}),
      ...(filters.to !== undefined ? { lte: filters.to } : {}),
    };
  }

  return where;
}

/** `true` para valores JSON presentes (não `null`/`undefined`). */
function isPresentJson(value: unknown): value is Prisma.InputJsonValue {
  return value !== null && value !== undefined;
}

/**
 * Monta o input de criação de um registro de auditoria. `before`/`after`/
 * `metadata` só entram quando presentes — ausentes ficam como SQL NULL (a coluna
 * é nullable), evitando o ruído de `Prisma.JsonNull` e espelhando a convenção do
 * web (CREATE sem `before`, DELETE sem `after`). Os campos `actor*`/ip/userAgent
 * são normalizados para `null` explícito.
 */
export function buildAuditLogCreateInput(
  data: CreateAuditLogData,
): Prisma.AuditLogCreateInput {
  return {
    actorId: data.actorId ?? null,
    actorEmail: data.actorEmail ?? null,
    actorRole: data.actorRole ?? null,
    action: data.action,
    entityType: data.entityType,
    entityId: data.entityId,
    ...(isPresentJson(data.before) ? { before: data.before } : {}),
    ...(isPresentJson(data.after) ? { after: data.after } : {}),
    ...(isPresentJson(data.metadata) ? { metadata: data.metadata } : {}),
    ipAddress: data.ipAddress ?? null,
    userAgent: data.userAgent ?? null,
  };
}
