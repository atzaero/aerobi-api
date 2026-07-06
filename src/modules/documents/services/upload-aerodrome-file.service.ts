import { HttpStatus, Injectable, Logger } from '@nestjs/common';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { httpError } from '@/common/exceptions/http-error.util';
import { getErrorMessage } from '@/common/utils/error.util';
import { resolveOperationalActorScope } from '@/common/utils/group-scope.util';
import { AuditAction, DocumentType } from '@/generated/prisma/client';
import { AuditRecorderService } from '@/modules/audit/services/audit-recorder.service';
import type { RecordAuditContext } from '@/modules/audit/services/audit-recorder.service';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import { GenerateGeojsonService } from '@/modules/geojsons/services/generate-geojson.service';
import { deriveMapFileType } from '@/modules/geojsons/utils/convert-aerodrome-source';
import { StorageService } from '@/modules/storage/services/storage.service';
import { resolveBestEffortPresignedUrl } from '@/modules/storage/utils/resolve-presigned-url';
import { UserRepository } from '@/modules/users/repositories/user.repository';

import { DocumentResponseDTO } from '../dtos/document-response.dto';
import {
  UploadAerodromeFileDTO,
  type UploadAerodromeFileType,
} from '../dtos/upload-aerodrome-file.dto';
import { DocumentMapper } from '../mappers/document.mapper';
import { buildDocumentCreateInput } from '../mappers/document.prisma.mapper';
import { DocumentRepository } from '../repositories/document.repository';
import { isAllowedAerodromeFile } from '../utils/aerodrome-file';
import { assertAerodromeInScope } from '../utils/assert-aerodrome-in-scope';
import { documentAuditSnapshot } from '../utils/document-audit';
import { buildDocumentStorageKey } from '../utils/document-storage';

/** `kml`/`image` → enum DocumentType. */
const UPLOAD_TYPE_TO_ENUM: Record<UploadAerodromeFileType, DocumentType> = {
  kml: DocumentType.KML,
  image: DocumentType.IMAGE,
};

const INVALID_FILE_MESSAGE: Record<UploadAerodromeFileType, string> = {
  kml: 'envie um arquivo KML/KMZ (Plano Básico)',
  image: 'envie uma imagem JPEG, PNG ou WebP',
};

/**
 * `POST /documents/aerodrome-file` — upload dedicado (kml/image), gate
 * `aerodrome:{mode}`. Valida mimetype/extensão restrita; sobe ao storage; cria o
 * doc; **soft-deleta o anterior ativo do mesmo tipo** (regra "1 ativo", na
 * ORDEM: cria antes de deletar, para o tipo nunca ficar sem ativo); dispara a
 * geração de GeoJSON best-effort para KML. Sincronização de `*_url` é follow-up.
 */
@Injectable()
export class UploadAerodromeFileService {
  private readonly logger = new Logger(UploadAerodromeFileService.name);

  constructor(
    private readonly repo: DocumentRepository,
    private readonly storage: StorageService,
    private readonly userRepository: UserRepository,
    private readonly errorMessageService: ErrorMessageService,
    private readonly auditRecorder: AuditRecorderService,
    private readonly generateGeojson: GenerateGeojsonService,
  ) {}

  async execute(
    dto: UploadAerodromeFileDTO,
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

    const type = UPLOAD_TYPE_TO_ENUM[dto.type];
    if (!isAllowedAerodromeFile(type, file)) {
      throw httpError(
        this.errorMessageService,
        ErrorCode.VALIDATION_FAILED,
        HttpStatus.BAD_REQUEST,
        { DETAILS: `arquivo inválido: ${INVALID_FILE_MESSAGE[dto.type]}` },
      );
    }

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

    /**
     * Regra "1 ativo": cria o novo documento e soft-deleta os anteriores do
     * mesmo tipo numa **única transação `Serializable`** (atômico e à prova de
     * uploads concorrentes — nunca deixa o tipo com 0 ou 2 ativos). O objeto no
     * storage dos anteriores é preservado.
     */
    let created;
    try {
      created = await this.repo.createSupersedingActive(
        buildDocumentCreateInput({
          aerodromeId: dto.aerodromeId,
          uf: aerodrome.uf,
          type,
          storageKey,
          originalFilename: file.originalname,
          mimeType: file.mimetype,
          sizeBytes: file.size,
          actorId: actor.id,
        }),
        dto.aerodromeId,
        type,
        actor.id,
      );
    } catch (err) {
      await this.storage.delete(storageKey).catch((delErr: unknown) => {
        this.logger.warn(
          `Falha ao limpar objeto órfão ${storageKey} após erro no upload: ${getErrorMessage(delErr)}`,
        );
      });
      throw err;
    }

    /**
     * Geração de GeoJSON best-effort para KML: consome o `GenerateGeojsonService`
     * (exportado pelo módulo geojson, #376). O próprio serviço já é best-effort
     * na conversão; aqui envolvemos em try/catch para que uma falha de infra não
     * derrube o upload — espelha o `upload-aerodrome-file` do web.
     */
    if (type === DocumentType.KML) {
      try {
        await this.generateGeojson.execute(
          {
            aerodromeId: dto.aerodromeId,
            fileType: deriveMapFileType(file.originalname),
            buffer: file.buffer,
            actorId: actor.id,
            sourceStoragePath: storageKey,
          },
          auditContext,
        );
      } catch (geojsonError) {
        this.logger.warn(
          `Geração de GeoJSON falhou (best-effort) para aeródromo ${dto.aerodromeId}: ${getErrorMessage(geojsonError)}`,
        );
      }
    }

    await this.auditRecorder.record(
      {
        action: dto.mode === 'create' ? AuditAction.CREATE : AuditAction.UPDATE,
        entityType: 'document',
        entityId: created.id,
        after: documentAuditSnapshot(created),
        metadata: {
          scope: 'aerodrome-file',
          aerodromeId: dto.aerodromeId,
          type,
        },
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
