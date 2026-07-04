import { HttpStatus, Injectable, Logger } from '@nestjs/common';

import { EmailService } from '@/common/email/email.service';
import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { httpError } from '@/common/exceptions/http-error.util';
import { getErrorMessage } from '@/common/utils/error.util';
import { resourceNotFound } from '@/common/utils/resource-not-found.util';
import { AuditAction, type LandingRequest } from '@/generated/prisma/client';
import { AuditRecorderService } from '@/modules/audit/services/audit-recorder.service';
import type { RecordAuditContext } from '@/modules/audit/services/audit-recorder.service';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import { UserRepository } from '@/modules/users/repositories/user.repository';

import { DecideLandingRequestDTO } from '../dtos/decide-landing-request.dto';
import { LandingRequestResponseDTO } from '../dtos/landing-request-response.dto';
import { buildLandingRequestDecidedEmail } from '../emails/landing-request-emails';
import {
  LandingRequestMapper,
  type LandingRequestReviewer,
} from '../mappers/landing-request.mapper';
import { buildDecideUpdateInput } from '../mappers/landing-request.prisma.mapper';
import { LandingRequestRepository } from '../repositories/landing-request.repository';
import { landingRequestAuditSnapshot } from '../utils/landing-request-audit';

/**
 * Decisão do coordenador sobre uma solicitação **pendente** (`PENDING →
 * APPROVED/REJECTED`). O escopo por grupo do recurso é garantido pelo
 * `GroupScopeGuard` (`:id`); aqui relemos o registro fresco, travamos a
 * re-decisão com **409** (espelha o guard do web), gravamos o ator real
 * (`reviewedBy = actor.id`) e notificamos o solicitante (best-effort). A
 * auditoria registra a transição (`UPDATE`).
 */
@Injectable()
export class DecideLandingRequestService {
  private readonly logger = new Logger(DecideLandingRequestService.name);

  constructor(
    private readonly repo: LandingRequestRepository,
    private readonly userRepository: UserRepository,
    private readonly emailService: EmailService,
    private readonly auditRecorder: AuditRecorderService,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(
    id: string,
    dto: DecideLandingRequestDTO,
    actor: AuthenticatedUser,
    auditContext: RecordAuditContext = {},
  ): Promise<LandingRequestResponseDTO> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw resourceNotFound(
        this.errorMessageService,
        'Solicitação de pouso',
        id,
      );
    }

    /**
     * Decisão atômica: a atualização só afeta a linha se ela ainda está
     * `PENDING`, fechando a janela TOCTOU de duas decisões concorrentes. `0`
     * linhas afetadas = já respondida (ou corrida perdida) → 409.
     */
    const affected = await this.repo.updateIfPending(
      id,
      buildDecideUpdateInput({
        decision: dto.decision,
        observation: dto.observation,
        reviewedBy: actor.id,
        reviewedAt: new Date(),
      }),
    );
    if (affected === 0) {
      throw httpError(
        this.errorMessageService,
        ErrorCode.CONFLICT,
        HttpStatus.CONFLICT,
        { DETAILS: 'solicitação já respondida' },
      );
    }

    const updated = (await this.repo.findById(id)) ?? existing;

    await this.auditRecorder.record(
      {
        action: AuditAction.UPDATE,
        entityType: 'landing_request',
        entityId: id,
        before: landingRequestAuditSnapshot(existing),
        after: landingRequestAuditSnapshot(updated),
        metadata: {
          aerodromeId: updated.aerodromeId,
          uf: updated.uf,
          decision: dto.decision,
        },
      },
      auditContext,
    );

    const reviewer = await this.resolveReviewer(actor);
    await this.notifyRequester(updated, dto, reviewer?.name ?? actor.email);

    return LandingRequestMapper.toApiRow(updated, { reviewer });
  }

  /** Resolve o objeto do revisor (o ator) para o response e o e-mail. */
  private async resolveReviewer(
    actor: AuthenticatedUser,
  ): Promise<LandingRequestReviewer | null> {
    const user = await this.userRepository.findById(actor.id);
    if (!user) {
      return null;
    }
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }

  private async notifyRequester(
    updated: LandingRequest,
    dto: DecideLandingRequestDTO,
    respondedByName: string,
  ): Promise<void> {
    if (!updated.email) {
      return;
    }
    try {
      const target = await this.repo.findTargetAerodrome(updated.aerodromeId);
      const destination = target
        ? `${target.name} (${target.icao})`
        : (updated.icao ?? '');
      await this.emailService.send(
        buildLandingRequestDecidedEmail(
          updated,
          destination,
          dto.decision,
          respondedByName,
          dto.observation ?? null,
        ),
      );
    } catch (err) {
      this.logger.warn(
        `Falha ao notificar solicitante da decisão ${updated.id} (best-effort): ${getErrorMessage(err)}`,
      );
    }
  }
}
