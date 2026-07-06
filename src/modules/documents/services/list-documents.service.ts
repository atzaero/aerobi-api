import { Injectable } from '@nestjs/common';

import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { resolveOperationalActorScope } from '@/common/utils/group-scope.util';
import { resolvePaginationParams } from '@/common/utils/pagination-params.util';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import { StorageService } from '@/modules/storage/services/storage.service';
import { resolveBestEffortPresignedUrl } from '@/modules/storage/utils/resolve-presigned-url';
import { UserRepository } from '@/modules/users/repositories/user.repository';

import { DocumentsPaginatedResponseDTO } from '../dtos/documents-paginated-response.dto';
import { ListDocumentsQueryDTO } from '../dtos/list-documents-query.dto';
import { DocumentMapper } from '../mappers/document.mapper';
import { DocumentRepository } from '../repositories/document.repository';
import { buildDocumentScopedWhere } from '../utils/build-document-where';
import { toDocumentTypeEnum } from '../utils/document-type';

const MAX_LIMIT = 100;

/**
 * Listagem de documentos: filtros `aerodromeId`/`type`/`search`, ordenação
 * `createdAt DESC` (repo), escopo operacional por grupo (fail-closed). A `url`
 * presigned é resolvida best-effort por linha.
 */
@Injectable()
export class ListDocumentsService {
  constructor(
    private readonly repo: DocumentRepository,
    private readonly storage: StorageService,
    private readonly userRepository: UserRepository,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(
    query: ListDocumentsQueryDTO,
    actor: AuthenticatedUser,
  ): Promise<DocumentsPaginatedResponseDTO> {
    const { page, limit, skip } = resolvePaginationParams(query, MAX_LIMIT);

    const scope = await resolveOperationalActorScope(
      actor.role,
      actor.id,
      this.userRepository,
      this.errorMessageService,
    );
    const where = buildDocumentScopedWhere(
      {
        aerodromeId: query.aerodromeId,
        type: query.type ? toDocumentTypeEnum(query.type) : undefined,
        search: query.search,
      },
      scope,
    );

    const [items, total] = await Promise.all([
      this.repo.findMany(where, skip, limit),
      this.repo.count(where),
    ]);

    const rows = await Promise.all(
      items.map(async (item) =>
        DocumentMapper.toApiRow(
          item,
          await resolveBestEffortPresignedUrl(this.storage, item.storageKey),
        ),
      ),
    );

    return new DocumentsPaginatedResponseDTO(rows, page, limit, total);
  }
}
