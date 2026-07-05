import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { EmailService } from '@/common/email/email.service';
import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import type { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { httpError } from '@/common/exceptions/http-error.util';
import { getErrorMessage } from '@/common/utils/error.util';
import { resourceNotFound } from '@/common/utils/resource-not-found.util';
import { AuditAction, type LandingRequest } from '@/generated/prisma/client';
import { AuditRecorderService } from '@/modules/audit/services/audit-recorder.service';
import type { RecordAuditContext } from '@/modules/audit/services/audit-recorder.service';
import { UserRepository } from '@/modules/users/repositories/user.repository';

import { CreateLandingRequestDTO } from '../dtos/create-landing-request.dto';
import { CreateLandingRequestResponseDTO } from '../dtos/create-landing-request-response.dto';
import {
  buildLandingRequestReceiptEmail,
  buildLandingRequestStaffEmail,
} from '../emails/landing-request-emails';
import {
  buildAircraftCreateData,
  buildLandingRequestCreateInput,
} from '../mappers/landing-request.prisma.mapper';
import { LandingRequestRepository } from '../repositories/landing-request.repository';
import type { TargetAerodrome } from '../repositories/landing-request.repository.interface';
import { resolveAircraftRegistration } from '../utils/aircraft-registration.util';
import { landingRequestAuditSnapshot } from '../utils/landing-request-audit';
import { validateLandingSchedule } from '../utils/validate-landing-schedule.util';
import { LookupRabAircraftService } from './lookup-rab-aircraft.service';
import { ValidatePilotLicenseService } from './validate-pilot-license.service';

/** Ator gravado no create público (não há usuário autenticado). */
const PUBLIC_ACTOR = 'public';

/**
 * Envio público (sem login) de solicitação de pouso. Espelha o create do
 * `aerobi-web`: valida a janela operacional e a matrícula (regras puras),
 * resolve o aeródromo-alvo (existe + aberto), valida a licença ANAC do piloto,
 * busca o snapshot RAB (matrícula nacional) e grava solicitação + snapshot numa
 * transação. O **comprovante ao piloto é load-bearing** — se o envio falha, a
 * solicitação é soft-deletada (compensação) e a operação retorna erro. A
 * notificação ao staff e a auditoria são best-effort.
 */
@Injectable()
export class CreateLandingRequestService {
  private readonly logger = new Logger(CreateLandingRequestService.name);

  constructor(
    private readonly repo: LandingRequestRepository,
    private readonly validatePilotLicense: ValidatePilotLicenseService,
    private readonly lookupRabAircraft: LookupRabAircraftService,
    private readonly emailService: EmailService,
    private readonly userRepository: UserRepository,
    private readonly config: ConfigService,
    private readonly auditRecorder: AuditRecorderService,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(
    dto: CreateLandingRequestDTO,
    auditContext: RecordAuditContext = {},
  ): Promise<CreateLandingRequestResponseDTO> {
    const now = new Date();

    /** Regras puras primeiro (equivalem ao superRefine do Zod do web). */
    const scheduleError = validateLandingSchedule(
      dto.departureAt,
      dto.landingAt,
      dto.exitAfterLandingAt,
      now,
    );
    if (scheduleError) {
      throw this.validationFailed(scheduleError);
    }

    const foreignRegistration = dto.foreignRegistration ?? false;
    const registration = resolveAircraftRegistration(
      dto.aircraftRegistration,
      foreignRegistration,
    );
    if (registration.error !== null) {
      throw this.validationFailed(registration.error);
    }

    /** Aeródromo-alvo: existe (404) e aberto (409); deriva icao/uf. */
    const target = await this.repo.findTargetAerodrome(dto.aerodromeId);
    if (!target) {
      throw resourceNotFound(
        this.errorMessageService,
        'Aeródromo',
        dto.aerodromeId,
      );
    }
    if (!target.isOpen) {
      throw httpError(
        this.errorMessageService,
        ErrorCode.CONFLICT,
        HttpStatus.CONFLICT,
        { DETAILS: 'aeródromo fechado para solicitações de pouso' },
      );
    }

    /** Validações externas: licença ANAC e (matrícula nacional) RAB. */
    await this.validatePilotLicense.execute(dto.pilotCpf, dto.anacPilotCode);
    const rabRow = await this.lookupRabAircraft.execute(
      registration.normalized,
      foreignRegistration,
    );

    /** Grava solicitação + snapshot numa transação. */
    const created = await this.repo.createWithAircraft(
      buildLandingRequestCreateInput({
        aerodromeId: target.id,
        requestDate: now,
        email: dto.email,
        pilotCode: dto.anacPilotCode,
        aircraftModel: dto.aircraftModel,
        aircraftRegistration: registration.normalized,
        departureAerodrome: dto.departureIcao,
        nextDestinationAerodrome: dto.nextDestinationIcao,
        observation: dto.notes?.trim() ? dto.notes.trim() : null,
        pilotName: dto.pilotName,
        pilotCpf: dto.pilotCpf,
        phoneContact: dto.phoneContact,
        requesterName: dto.requesterName,
        peopleOnBoard: dto.peopleOnBoard,
        acceptedTerms: dto.acceptedTerms,
        confirmedTrue: dto.confirmedTrue,
        foreignRegistration,
        icao: target.icao.trim().toUpperCase(),
        uf: target.uf,
        departureAt: dto.departureAt,
        landingAt: dto.landingAt,
        exitAfterLandingAt: dto.exitAfterLandingAt,
        createdBy: PUBLIC_ACTOR,
      }),
      rabRow ? buildAircraftCreateData(rabRow) : null,
    );

    const destination = `${target.name} (${target.icao})`;

    /**
     * Comprovante ao piloto (load-bearing) + compensação se falhar. Fica **antes**
     * da auditoria: um create compensado (soft-delete) não deve deixar um
     * `CREATE` órfão na trilha (paridade com a ordem do web).
     */
    const receiptSent = await this.emailService.send(
      buildLandingRequestReceiptEmail(created, destination),
    );
    if (!receiptSent) {
      await this.compensateFailedReceipt(created.id);
      throw httpError(
        this.errorMessageService,
        ErrorCode.EMAIL_SEND_FAILED,
        HttpStatus.BAD_GATEWAY,
        { EMAIL: created.email ?? '' },
      );
    }

    await this.auditRecorder.record(
      {
        action: AuditAction.CREATE,
        entityType: 'landing_request',
        entityId: created.id,
        after: landingRequestAuditSnapshot(created),
        metadata: {
          aerodromeId: created.aerodromeId,
          uf: created.uf,
          source: 'public',
        },
      },
      auditContext,
    );

    /** Notificação ao staff (best-effort). */
    await this.notifyStaff(created, target, destination);

    return { id: created.id, uf: created.uf };
  }

  private validationFailed(details: string): CustomHttpException {
    return httpError(
      this.errorMessageService,
      ErrorCode.VALIDATION_FAILED,
      HttpStatus.BAD_REQUEST,
      /** Remove o ponto final da mensagem-fonte: o template já adiciona um. */
      { DETAILS: details.replace(/\.+$/, '') },
    );
  }

  /**
   * Soft-delete compensatório quando o comprovante não pôde ser enviado — a
   * solicitação não fica "órfã" sem confirmação ao piloto. É best-effort: se a
   * própria compensação falhar, apenas loga (o erro ao cliente já foi decidido).
   */
  private async compensateFailedReceipt(id: string): Promise<void> {
    try {
      await this.repo.softDelete(id, 'system');
    } catch (err) {
      this.logger.error(
        `Falha na compensação (soft-delete) da solicitação ${id}: ${getErrorMessage(err)}`,
      );
    }
  }

  private async notifyStaff(
    created: LandingRequest,
    target: TargetAerodrome,
    destination: string,
  ): Promise<void> {
    try {
      const recipients = await this.userRepository.findGroupStaffEmails(
        target.groupId,
      );
      if (recipients.length === 0) {
        return;
      }
      const frontendUrl = this.config.get<string>('FRONTEND_URL') ?? '';
      const panelUrl = `${frontendUrl}/landing-requests`;
      await this.emailService.send(
        buildLandingRequestStaffEmail(
          created,
          destination,
          recipients,
          panelUrl,
        ),
      );
    } catch (err) {
      this.logger.warn(
        `Falha ao notificar staff da solicitação ${created.id} (best-effort): ${getErrorMessage(err)}`,
      );
    }
  }
}
