import { HttpStatus, Injectable } from '@nestjs/common';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { resourceNotFound } from '@/common/utils/resource-not-found.util';

import {
  ResendMaintenanceInvitationsDTO,
  ResendMaintenanceInvitationsResponseDTO,
} from '../dtos/resend-maintenance-invitations.dto';
import { MaintenanceRepository } from '../repositories/maintenance.repository';
import { isMaintenancePublicAccess } from '../utils/maintenance-domain.util';
import { MaintenanceInvitationMailerService } from './maintenance-invitation-mailer.service';

@Injectable()
export class ResendMaintenanceInvitationsService {
  constructor(
    private readonly repo: MaintenanceRepository,
    private readonly errorMessageService: ErrorMessageService,
    private readonly mailer: MaintenanceInvitationMailerService,
  ) {}

  async execute(
    id: string,
    dto: ResendMaintenanceInvitationsDTO,
  ): Promise<ResendMaintenanceInvitationsResponseDTO> {
    const plan = await this.repo.findById(id);
    if (!plan) {
      throw resourceNotFound(this.errorMessageService, 'Manutenção', id);
    }

    if (!isMaintenancePublicAccess(plan)) {
      throw new CustomHttpException(
        this.errorMessageService.getMessage(ErrorCode.VALIDATION_FAILED, {
          DETAILS:
            'Cadastre e-mails autorizados para habilitar o acesso público antes de reenviar convites',
        }),
        HttpStatus.BAD_REQUEST,
        ErrorCode.VALIDATION_FAILED,
      );
    }

    const normalized = dto.emails.map((e) => e.trim().toLowerCase());
    const allowed = new Set(
      plan.authorizedEmails.map((e) => e.trim().toLowerCase()),
    );
    const invalid = normalized.filter((e) => !allowed.has(e));
    if (invalid.length > 0) {
      throw new CustomHttpException(
        this.errorMessageService.getMessage(ErrorCode.VALIDATION_FAILED, {
          DETAILS: 'Um ou mais e-mails não estão autorizados nesta intervenção',
        }),
        HttpStatus.BAD_REQUEST,
        ErrorCode.VALIDATION_FAILED,
      );
    }

    const uniqueEmails = Array.from(new Set(normalized.filter(Boolean)));

    const result = await this.mailer.sendInvitations({
      maintenanceId: plan.id,
      aerodromeId: plan.aerodromeId,
      emails: uniqueEmails,
      securityCode: plan.securityCode ?? '',
    });

    this.mailer.throwIfAllFailed(result);

    const response = new ResendMaintenanceInvitationsResponseDTO();
    response.sent = result.sent;
    response.failed = result.failed;
    return response;
  }
}
