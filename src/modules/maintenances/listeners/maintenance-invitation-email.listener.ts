import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { maskEmail } from '@/common/utils/mask-email.util';

import {
  MAINTENANCE_INVITED_EVENT,
  MaintenanceInvitedEvent,
} from '../events/maintenance-invited.event';
import { MaintenanceInvitationMailerService } from '../services/maintenance-invitation-mailer.service';

@Injectable()
export class MaintenanceInvitationEmailListener {
  private readonly logger = new Logger(MaintenanceInvitationEmailListener.name);

  constructor(private readonly mailer: MaintenanceInvitationMailerService) {}

  @OnEvent(MAINTENANCE_INVITED_EVENT)
  async handle(event: MaintenanceInvitedEvent): Promise<void> {
    if (event.emails.length === 0 || !event.securityCode.trim()) return;

    try {
      const result = await this.mailer.sendInvitations({
        maintenanceId: event.maintenanceId,
        aerodromeId: event.aerodromeId,
        emails: event.emails,
        securityCode: event.securityCode,
      });

      this.logger.log(
        `Maintenance invites sent maintenanceId=${event.maintenanceId} ` +
          `sent=${result.sent.length} failed=${result.failed.length} ` +
          `recipients=${event.emails.map(maskEmail).join(',')}`,
      );
    } catch (err) {
      this.logger.error(
        `Falha ao enviar convites maintenanceId=${event.maintenanceId}: ${String(err)}`,
      );
    }
  }
}
