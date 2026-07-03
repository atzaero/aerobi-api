import { Injectable, Logger } from '@nestjs/common';

import { getErrorMessage } from '@/common/utils/error.util';
import type { AuditAction, UserRole } from '@/generated/prisma/client';

import type { AuditEntityType } from '../constants/audit-entity-type';
import { AuditLogRepository } from '../repositories/audit-log.repository';

/**
 * Recorte da ação auditada montado pelo call-site. `before`/`after` são
 * snapshots **parciais** (só os campos relevantes) e `metadata` guarda pares
 * extras (`groupId`/`uf`/`scope`/…). Convenção: CREATE sem `before`, DELETE sem
 * `after`.
 */
export interface RecordAuditInput {
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  before?: unknown;
  after?: unknown;
  metadata?: Record<string, unknown>;
}

/**
 * Contexto da requisição/ator no momento da ação. Todos opcionais para cobrir
 * ação pública/sistêmica (sem login). Montado no controller via
 * `buildAuditContext(actor, request)`.
 */
export interface RecordAuditContext {
  actorId?: string | null;
  actorEmail?: string | null;
  actorRole?: UserRole | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

/**
 * Núcleo de **escrita** da auditoria (Bloco B da #367), injetado nos módulos que
 * fazem mutações. É **interno** — não há rota HTTP de gravação (evita
 * falsificação de trilha). Espelha o `recordAudit` do `aerobi-web`:
 * **best-effort**, uma falha de auditoria é logada e engolida, nunca derruba a
 * ação de negócio originadora.
 */
@Injectable()
export class AuditRecorderService {
  private readonly logger = new Logger(AuditRecorderService.name);

  constructor(private readonly repository: AuditLogRepository) {}

  /**
   * Grava um registro de auditoria. Nunca lança: em caso de erro apenas registra
   * no log (a observabilidade não pode bloquear a operação que a originou).
   */
  async record(
    input: RecordAuditInput,
    context: RecordAuditContext = {},
  ): Promise<void> {
    try {
      await this.repository.create({
        actorId: context.actorId ?? null,
        actorEmail: context.actorEmail ?? null,
        actorRole: context.actorRole ?? null,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        before: input.before,
        after: input.after,
        metadata: input.metadata,
        ipAddress: context.ipAddress ?? null,
        userAgent: context.userAgent ?? null,
      });
    } catch (err) {
      this.logger.error(
        `Falha ao gravar auditoria (silenciada) action=${input.action} ` +
          `entityType=${input.entityType} entityId=${input.entityId}: ` +
          getErrorMessage(err),
        err instanceof Error ? err.stack : undefined,
      );
    }
  }
}
