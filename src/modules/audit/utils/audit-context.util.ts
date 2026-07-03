import type { Request } from 'express';

import { extractIpAddress } from '@/common/utils/extract-ip-address.util';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import type { RecordAuditContext } from '../services/audit-recorder.service';

/**
 * Monta o `RecordAuditContext` a partir do ator autenticado (`@CurrentUser`) e
 * do `Request` (`@Req`) — snapshot de `actorId/email/role` + ip/userAgent.
 * Espelha o `captureRequestContext` do `aerobi-web`. Ator ausente (rota pública)
 * resulta em `actor*` nulos.
 */
export function buildAuditContext(
  actor: AuthenticatedUser | undefined,
  request: Request,
): RecordAuditContext {
  return {
    actorId: actor?.id ?? null,
    actorEmail: actor?.email ?? null,
    actorRole: actor?.role ?? null,
    ipAddress: extractIpAddress(request) ?? null,
    userAgent: request.headers['user-agent'] ?? null,
  };
}
