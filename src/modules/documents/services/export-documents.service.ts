import { Injectable, Logger } from '@nestjs/common';

import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { EXPORT_MAX_ROWS, toCsv } from '@/common/utils/csv.util';
import { getErrorMessage } from '@/common/utils/error.util';
import { resolveOperationalActorScope } from '@/common/utils/group-scope.util';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import { StorageService } from '@/modules/storage/services/storage.service';
import { resolveBestEffortPresignedUrl } from '@/modules/storage/utils/resolve-presigned-url';
import { UserRepository } from '@/modules/users/repositories/user.repository';

import { ExportDocumentsQueryDTO } from '../dtos/export-documents-query.dto';
import {
  documentExportColumns,
  type DocumentExportRow,
} from '../mappers/document-export.columns';
import { DocumentRepository } from '../repositories/document.repository';
import { buildDocumentScopedWhere } from '../utils/build-document-where';
import { toDocumentTypeEnum } from '../utils/document-type';

/** CSV + sinais de truncamento expostos pelo controller (X-Export-*). */
export interface ExportDocumentsResult {
  csv: string;
  truncated: boolean;
  total: number;
}

/**
 * Export CSV de documentos: mesmo escopo/filtros da listagem; 6 colunas na ordem
 * do web. Resolve a `url` presigned best-effort por linha (não persistimos URL).
 * Busca `EXPORT_MAX_ROWS + 1` para detectar truncamento.
 */
@Injectable()
export class ExportDocumentsService {
  private readonly logger = new Logger(ExportDocumentsService.name);

  constructor(
    private readonly repo: DocumentRepository,
    private readonly storage: StorageService,
    private readonly userRepository: UserRepository,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(
    query: ExportDocumentsQueryDTO,
    actor: AuthenticatedUser,
  ): Promise<ExportDocumentsResult> {
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

    const found = await this.repo.findAllForExport(where, EXPORT_MAX_ROWS + 1);
    const truncated = found.length > EXPORT_MAX_ROWS;
    const rows = truncated ? found.slice(0, EXPORT_MAX_ROWS) : found;

    const exportRows: DocumentExportRow[] = await Promise.all(
      rows.map(async (doc) => ({
        ...doc,
        url: await resolveBestEffortPresignedUrl(this.storage, doc.storageKey),
      })),
    );

    let total = rows.length;
    if (truncated) {
      try {
        total = Math.max(await this.repo.count(where), EXPORT_MAX_ROWS);
      } catch (err) {
        total = EXPORT_MAX_ROWS;
        this.logger.warn(
          `count do total truncado falhou (best-effort): ${getErrorMessage(err)}`,
        );
      }
      this.logger.warn(
        `Export de documentos truncado em ${EXPORT_MAX_ROWS} de ${total} linhas.`,
      );
    }

    return {
      csv: toCsv(exportRows, documentExportColumns),
      truncated,
      total,
    };
  }
}
