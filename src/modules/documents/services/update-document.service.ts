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
import { UpdateDocumentDTO } from '../dtos/update-document.dto';
import { DocumentMapper } from '../mappers/document.mapper';
import { DocumentRepository } from '../repositories/document.repository';
import { documentAuditSnapshot } from '../utils/document-audit';

/**
 * Atualização de um documento — **só `originalFilename`** (paridade web). Não
 * toca storage/`storageKey`/tipo. `updatedBy = actor.id`; auditoria UPDATE. O
 * escopo por grupo é garantido pelo `GroupScopeGuard` no controller.
 */
@Injectable()
export class UpdateDocumentService {
  constructor(
    private readonly repo: DocumentRepository,
    private readonly storage: StorageService,
    private readonly errorMessageService: ErrorMessageService,
    private readonly auditRecorder: AuditRecorderService,
  ) {}

  async execute(
    id: string,
    dto: UpdateDocumentDTO,
    actor: AuthenticatedUser,
    auditContext: RecordAuditContext = {},
  ): Promise<DocumentResponseDTO> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw resourceNotFound(this.errorMessageService, 'Documento', id);
    }

    const updated = await this.repo.update(id, {
      originalFilename: dto.originalFilename,
      updatedBy: actor.id,
    });

    await this.auditRecorder.record(
      {
        action: AuditAction.UPDATE,
        entityType: 'document',
        entityId: id,
        before: documentAuditSnapshot(existing),
        after: documentAuditSnapshot(updated),
        metadata: { scope: 'rename' },
      },
      auditContext,
    );

    const url = await resolveBestEffortPresignedUrl(
      this.storage,
      updated.storageKey,
    );
    return DocumentMapper.toApiRow(updated, url);
  }
}
