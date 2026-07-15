import { Injectable } from '@nestjs/common';

import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { resourceNotFound } from '@/common/utils/resource-not-found.util';
import { StorageService } from '@/modules/storage/services/storage.service';
import { resolveBestEffortPresignedUrl } from '@/modules/storage/utils/resolve-presigned-url';

import { DocumentResponseDTO } from '../dtos/document-response.dto';
import { DocumentMapper } from '../mappers/document.mapper';
import { DocumentRepository } from '../repositories/document.repository';

export type FindDocumentByIdServiceInput = { id: string };

/**
 * Busca de um documento por id (com `url` presigned). 404 se
 * inexistente/soft-deletado; o escopo por grupo é garantido pelo
 * `GroupScopeGuard` (`GroupScopeSubject.DOCUMENT`) no controller.
 */
@Injectable()
export class FindDocumentByIdService {
  constructor(
    private readonly repo: DocumentRepository,
    private readonly storage: StorageService,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(
    input: FindDocumentByIdServiceInput,
  ): Promise<DocumentResponseDTO> {
    const entity = await this.repo.findById(input.id);
    if (!entity) {
      throw resourceNotFound(this.errorMessageService, 'Documento', input.id);
    }
    const url = await resolveBestEffortPresignedUrl(
      this.storage,
      entity.storageKey,
    );
    return DocumentMapper.toApiRow(entity, url);
  }
}
