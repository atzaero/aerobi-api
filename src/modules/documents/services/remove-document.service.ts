import { Injectable } from '@nestjs/common';

import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { resourceNotFound } from '@/common/utils/resource-not-found.util';
import { AuditAction } from '@/generated/prisma/client';
import { AuditRecorderService } from '@/modules/audit/services/audit-recorder.service';
import type { RecordAuditContext } from '@/modules/audit/services/audit-recorder.service';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import { StorageService } from '@/modules/storage/services/storage.service';
import { resolveBestEffortPresignedUrl } from '@/modules/storage/utils/resolve-presigned-url';

import { DocumentResponseDTO } from '../dtos/document-response.dto';
import { DocumentMapper } from '../mappers/document.mapper';
import { DocumentRepository } from '../repositories/document.repository';
import { documentAuditSnapshot } from '../utils/document-audit';

/**
 * Soft-delete de um documento (`document:delete` é ADMIN-only; escopo por grupo
 * pelo `GroupScopeGuard` no `:id`). O objeto no storage é **preservado**
 * (reversível). Ator real (`deletedBy = actor.id`) + auditoria DELETE. As
 * `*_url` do aeródromo são resolvidas on-read a partir dos documentos ativos
 * (não há coluna desnormalizada a recomputar aqui; #550).
 */
@Injectable()
export class RemoveDocumentService {
  constructor(
    private readonly repo: DocumentRepository,
    private readonly storage: StorageService,
    private readonly errorMessageService: ErrorMessageService,
    private readonly auditRecorder: AuditRecorderService,
  ) {}

  async execute(
    id: string,
    actor: AuthenticatedUser,
    auditContext: RecordAuditContext = {},
  ): Promise<DocumentResponseDTO> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw resourceNotFound(this.errorMessageService, 'Documento', id);
    }

    const deleted = await this.repo.softDelete(id, actor.id);

    await this.auditRecorder.record(
      {
        action: AuditAction.DELETE,
        entityType: 'document',
        entityId: id,
        before: documentAuditSnapshot(existing),
      },
      auditContext,
    );

    const url = await resolveBestEffortPresignedUrl(
      this.storage,
      deleted.storageKey,
    );
    return DocumentMapper.toApiRow(deleted, url);
  }
}
