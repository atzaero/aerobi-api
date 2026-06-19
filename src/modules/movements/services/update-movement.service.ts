import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { ConformityStatus } from '@/generated/prisma/enums';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { RabRowRepository } from '@/modules/rab/repositories/rab-row.repository';
import { normalizeMarcas } from '@/modules/rab/utils/normalize-marcas';
import { StorageService } from '@/modules/storage/services/storage.service';

import { MovementResponseDTO } from '../dtos/movement-response.dto';
import {
  MOVEMENT_CONFORMITY_REQUESTED_EVENT,
  type MovementConformityRequestedEvent,
} from '../events/movement-conformity-requested.event';
import { buildAircraftSnapshotCreateInput } from '../mappers/aircraft-snapshot.prisma.mapper';
import { MovementMapper } from '../mappers/movement.mapper';
import { MovementRepository } from '../repositories/movement.repository';
import { isConformityApplicable } from '../utils/conformity-status.util';
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
    private readonly eventEmitter: EventEmitter2,
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

    /**
     * Corrigir a matrícula invalida a conformidade calculada para a matrícula
     * anterior. Quando a matrícula muda e a regra se aplica (pouso com ICAO),
     * o status volta a `PENDING` na mesma transação e a reavaliação é disparada
     * abaixo. Sem mudança de matrícula (ou regra não aplicável), preservamos o
     * status atual.
     */
    const registrationChanged = registration !== existing.registration;
    const applicable = isConformityApplicable({
      operationType: existing.operationType,
      aerodrome: existing.aerodrome,
    });
    const shouldReevaluate = registrationChanged && applicable;

    const updated = await this.repo.updateRegistration(
      input.id,
      registration,
      snapshot,
      input.updatedBy,
      shouldReevaluate ? ConformityStatus.PENDING : undefined,
    );

    if (shouldReevaluate) {
      /**
       * Dispara apenas a reavaliação de conformidade (não as notificações de
       * criação): o `ConformityListener` reavalia contra a nova matrícula e
       * resolve o status final. Emissão fire-and-forget — o handler é assíncrono
       * e desacoplado, não bloqueia nem altera a resposta desta edição.
       */
      const payload: MovementConformityRequestedEvent = {
        movementId: updated.id,
        registration: updated.registration,
        aerodrome: updated.aerodrome,
        operationType: updated.operationType,
        source: updated.source,
        readingDatetime: updated.readingDatetime,
      };
      this.eventEmitter.emit(MOVEMENT_CONFORMITY_REQUESTED_EVENT, payload);
    }

    const imageUrl = await resolveReadingImageUrl(
      this.storage,
      updated.imageKey,
    );
    return MovementMapper.toApiRow(updated, imageUrl);
  }
}
