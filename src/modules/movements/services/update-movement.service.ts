import { HttpStatus, Injectable, Logger } from '@nestjs/common';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { RabRowRepository } from '@/modules/rab/repositories/rab-row.repository';
import { normalizeMarcas } from '@/modules/rab/utils/normalize-marcas';
import { StorageService } from '@/modules/storage/services/storage.service';

import { MovementResponseDTO } from '../dtos/movement-response.dto';
import { buildAircraftSnapshotCreateInput } from '../mappers/aircraft-snapshot.prisma.mapper';
import { MovementMapper } from '../mappers/movement.mapper';
import { MovementRepository } from '../repositories/movement.repository';
import { resolveReadingImageUrl } from '../utils/resolve-reading-image-url';

/**
 * Entrada do {@link UpdateMovementService.execute}: o id do movimento, a
 * matrícula tolerante (será normalizada) e o autor da edição (auditoria).
 */
export interface UpdateMovementInput {
  id: string;
  registration: string;
  updatedBy: string;
}

/**
 * Corrige a matrícula de um movimento já registrado. Caso de uso motivado por
 * leituras OCR equivocadas da câmera (aviascan-cv): a imagem está nítida, mas a
 * matrícula foi identificada errada. Apenas `registration` é editável.
 */
@Injectable()
export class UpdateMovementService {
  private readonly logger = new Logger(UpdateMovementService.name);

  constructor(
    private readonly repo: MovementRepository,
    private readonly storage: StorageService,
    private readonly errorMessageService: ErrorMessageService,
    private readonly rabRowRepo: RabRowRepository,
  ) {}

  async execute(input: UpdateMovementInput): Promise<MovementResponseDTO> {
    const existing = await this.repo.findById(input.id);
    if (!existing) {
      throw new CustomHttpException(
        this.errorMessageService.getMessage(ErrorCode.RESOURCE_NOT_FOUND, {
          RESOURCE: 'Movimento',
          ID: input.id,
        }),
        HttpStatus.NOT_FOUND,
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }

    /**
     * Normaliza a matrícula para a forma canônica (sem hífen/espaços,
     * maiúsculas) na fronteira do service — mesma decisão de domínio da criação.
     * Tudo a jusante (lookup RAB, persistência) opera sobre a forma canônica.
     */
    const registration = normalizeMarcas(input.registration);

    /**
     * Re-resolve o snapshot RAB para a matrícula corrigida. Como o snapshot foi
     * congelado na criação a partir da matrícula (potencialmente errada), a
     * correção precisa re-resolvê-lo para manter a consistência matrícula↔aeronave.
     * Sem match no RAB, o snapshot é gravado vazio (todos os campos `null`) —
     * o movimento não falha, apenas registramos um aviso.
     */
    const rabRow = await this.rabRowRepo.findLatestByMarcas(registration);

    if (!rabRow) {
      this.logger.warn(
        `Matrícula ${registration} sem linha RAB correspondente — snapshot de aeronave re-resolvido vazio.`,
      );
    }
    const snapshot = buildAircraftSnapshotCreateInput(rabRow);

    const updated = await this.repo.updateRegistration(
      input.id,
      registration,
      snapshot,
      input.updatedBy,
    );

    const imageUrl = await resolveReadingImageUrl(
      this.storage,
      updated.imageKey,
    );
    return MovementMapper.toApiRow(updated, imageUrl);
  }
}
