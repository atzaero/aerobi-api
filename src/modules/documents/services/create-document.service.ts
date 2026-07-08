import { HttpStatus, Injectable, Logger } from '@nestjs/common';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { httpError } from '@/common/exceptions/http-error.util';
import { getErrorMessage } from '@/common/utils/error.util';
import {
  assertAerodromeInScope,
  resolveOperationalActorScope,
} from '@/common/utils/group-scope.util';
import { AuditAction } from '@/generated/prisma/client';
import { AuditRecorderService } from '@/modules/audit/services/audit-recorder.service';
import type { RecordAuditContext } from '@/modules/audit/services/audit-recorder.service';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import { StorageService } from '@/modules/storage/services/storage.service';
import { resolveBestEffortPresignedUrl } from '@/modules/storage/utils/resolve-presigned-url';
import { UserRepository } from '@/modules/users/repositories/user.repository';

import { CreateDocumentDTO } from '../dtos/create-document.dto';
import { DocumentResponseDTO } from '../dtos/document-response.dto';
import { DocumentMapper } from '../mappers/document.mapper';
import { buildDocumentCreateInput } from '../mappers/document.prisma.mapper';
import { DocumentRepository } from '../repositories/document.repository';
import { documentAuditSnapshot } from '../utils/document-audit';
import { buildDocumentStorageKey } from '../utils/document-storage';
import { toDocumentTypeEnum } from '../utils/document-type';

const DEFAULT_MIME = 'application/octet-stream';

/**
 * `POST /documents` genérico (8 tipos, qualquer mimetype). Valida o escopo do
 * aeródromo de destino, sobe o arquivo ao storage e persiste os metadados.
 * **Não** soft-deleta anteriores (múltiplos coexistem — paridade com o web); a
 * regra "1 ativo" é exclusiva do `upload-aerodrome-file`. Não sincroniza `*_url`
 * (follow-up). Ator real na auditoria.
 */
@Injectable()
export class CreateDocumentService {
  private readonly logger = new Logger(CreateDocumentService.name);

  constructor(
    private readonly repo: DocumentRepository,
    private readonly storage: StorageService,
    private readonly userRepository: UserRepository,
    private readonly errorMessageService: ErrorMessageService,
    private readonly auditRecorder: AuditRecorderService,
  ) {}

  async execute(
    dto: CreateDocumentDTO,
    file: Express.Multer.File | undefined,
    actor: AuthenticatedUser,
    auditContext: RecordAuditContext = {},
  ): Promise<DocumentResponseDTO> {
    if (!file || !file.buffer || file.size === 0) {
      throw httpError(
        this.errorMessageService,
        ErrorCode.VALIDATION_FAILED,
        HttpStatus.BAD_REQUEST,
        { DETAILS: 'arquivo ausente ou vazio (campo `file`)' },
      );
    }

    const type = toDocumentTypeEnum(dto.type);

    const scope = await resolveOperationalActorScope(
      actor.role,
      actor.id,
      this.userRepository,
      this.errorMessageService,
    );
    const aerodrome = assertAerodromeInScope(
      await this.repo.findAerodromeForScope(dto.aerodromeId),
      scope,
      this.errorMessageService,
      dto.aerodromeId,
    );

    const storageKey = buildDocumentStorageKey(
      dto.aerodromeId,
      type,
      file.originalname,
    );
    await this.storage.upload(file, storageKey);

    let created;
    try {
      created = await this.repo.create(
        buildDocumentCreateInput({
          aerodromeId: dto.aerodromeId,
          uf: aerodrome.uf,
          type,
          storageKey,
          originalFilename: file.originalname,
          mimeType: file.mimetype || DEFAULT_MIME,
          sizeBytes: file.size,
          actorId: actor.id,
        }),
      );
    } catch (err) {
      await this.storage.delete(storageKey).catch((delErr: unknown) => {
        this.logger.warn(
          `Falha ao limpar objeto órfão ${storageKey} após erro no create: ${getErrorMessage(delErr)}`,
        );
      });
      throw err;
    }

    await this.auditRecorder.record(
      {
        action: AuditAction.CREATE,
        entityType: 'document',
        entityId: created.id,
        after: documentAuditSnapshot(created),
        metadata: { aerodromeId: dto.aerodromeId, type },
      },
      auditContext,
    );

    const url = await resolveBestEffortPresignedUrl(
      this.storage,
      created.storageKey,
    );
    return DocumentMapper.toApiRow(created, url);
  }
}
