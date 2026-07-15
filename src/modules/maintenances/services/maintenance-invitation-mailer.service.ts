import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { EmailService } from '@/common/email/email.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { getErrorMessage } from '@/common/utils/error.util';

import { MaintenanceRepository } from '../repositories/maintenance.repository';

export interface SendMaintenanceInvitationsResult {
  sent: string[];
  failed: string[];
}

/**
 * Envia convites de sugestão de manutenção (best-effort por destinatário).
 */
@Injectable()
export class MaintenanceInvitationMailerService {
  private readonly logger = new Logger(MaintenanceInvitationMailerService.name);
  private readonly frontendUrl: string;

  constructor(
    private readonly emailService: EmailService,
    private readonly maintenanceRepo: MaintenanceRepository,
    private readonly errorMessageService: ErrorMessageService,
    config: ConfigService,
  ) {
    this.frontendUrl = config.get<string>(
      'FRONTEND_URL',
      'http://localhost:3000',
    );
  }

  async sendInvitations(params: {
    maintenanceId: string;
    aerodromeId: string;
    emails: readonly string[];
    securityCode: string;
  }): Promise<SendMaintenanceInvitationsResult> {
    const { maintenanceId, aerodromeId, emails, securityCode } = params;
    if (emails.length === 0) return { sent: [], failed: [] };

    let aerodromeName = '';
    let aerodromeIcao: string | null = null;
    try {
      const aerodrome =
        await this.maintenanceRepo.findAerodromeInvitationLabel(aerodromeId);
      aerodromeName = aerodrome?.name ?? '';
      aerodromeIcao = aerodrome?.icao ?? null;
    } catch (err) {
      this.logger.warn(
        `Falha ao resolver aeródromo ${aerodromeId}: ${getErrorMessage(err)}`,
      );
    }

    const label = this.aerodromeLabel(aerodromeName, aerodromeIcao);
    const sent: string[] = [];
    const failed: string[] = [];

    await Promise.all(
      emails.map(async (email) => {
        const link = `${this.frontendUrl}/maintenances-feedback/${encodeURIComponent(maintenanceId)}?email=${encodeURIComponent(email)}`;
        const ok = await this.emailService.send({
          to: email,
          subject: `Convite para enviar sugestões — ${label}`,
          template: 'maintenance_invitation',
          variables: {
            AERODROME_LABEL: label,
            LINK: link,
            SECURITY_CODE: securityCode,
          },
        });
        if (ok) sent.push(email);
        else failed.push(email);
      }),
    );

    return { sent, failed };
  }

  throwIfAllFailed(result: SendMaintenanceInvitationsResult): void {
    if (result.sent.length === 0 && result.failed.length > 0) {
      throw new CustomHttpException(
        this.errorMessageService.getMessage(ErrorCode.EMAIL_SEND_FAILED),
        HttpStatus.BAD_GATEWAY,
        ErrorCode.EMAIL_SEND_FAILED,
      );
    }
  }

  private aerodromeLabel(name: string, icao: string | null): string {
    const trimmed = name.trim();
    if (trimmed && icao) return `${trimmed} (${icao})`;
    return icao || trimmed || 'um aeródromo';
  }
}
