import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';

import { EmailService } from '@/common/email/email.service';
import { formatEmailDate } from '@/common/email/utils/format-email-date.util';
import { getErrorMessage } from '@/common/utils/error.util';
import { UserRole } from '@/generated/prisma/client';

import {
  USER_INVITED_EVENT,
  UserInvitedEvent,
} from '../events/user-invited.event';

const ROLE_LABEL: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Administrador',
  [UserRole.COORDINATOR]: 'Coordenador',
  [UserRole.OPERATOR]: 'Operador',
  [UserRole.TECHNICAL]: 'Técnico',
};

@Injectable()
export class InviteEmailListener {
  private readonly logger = new Logger(InviteEmailListener.name);
  private readonly frontendUrl: string;

  constructor(
    private readonly emailService: EmailService,
    config: ConfigService,
  ) {
    this.frontendUrl = config.get<string>(
      'FRONTEND_URL',
      'http://localhost:3000',
    );
  }

  @OnEvent(USER_INVITED_EVENT)
  async handle(event: UserInvitedEvent): Promise<void> {
    const acceptUrl = `${this.frontendUrl}/accept-invite?token=${encodeURIComponent(
      event.inviteTokenPlain,
    )}&email=${encodeURIComponent(event.email)}`;

    try {
      await this.emailService.send({
        to: event.email,
        subject: 'Convite Aerobi',
        template: 'invite',
        variables: {
          NAME: event.name,
          INVITED_BY: event.invitedByName ?? 'a equipe Aerobi',
          ROLE_LABEL: ROLE_LABEL[event.role],
          ACCEPT_URL: acceptUrl,
          EXPIRES_AT: formatEmailDate(event.expiresAt),
        },
      });

      this.logger.log(
        `Invite email sent userId=${event.userId} email=${event.email}`,
      );
    } catch (err) {
      this.logger.error(
        `Falha ao enviar invite email userId=${event.userId} email=${event.email}: ${getErrorMessage(
          err,
        )}`,
      );
    }
  }
}
