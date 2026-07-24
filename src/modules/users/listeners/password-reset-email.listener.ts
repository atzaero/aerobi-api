import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';

import { EmailService } from '@/common/email/email.service';
import { formatEmailDate } from '@/common/email/utils/format-email-date.util';
import { getErrorMessage } from '@/common/utils/error.util';

import {
  PASSWORD_RESET_TOKEN_SENT_EVENT,
  PasswordResetTokenSentEvent,
} from '../events/password-reset-token-sent.event';

@Injectable()
export class PasswordResetEmailListener {
  private readonly logger = new Logger(PasswordResetEmailListener.name);
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

  @OnEvent(PASSWORD_RESET_TOKEN_SENT_EVENT)
  async handle(event: PasswordResetTokenSentEvent): Promise<void> {
    const resetUrl = `${this.frontendUrl}/reset-password?token=${encodeURIComponent(
      event.resetTokenPlain,
    )}&email=${encodeURIComponent(event.email)}`;

    try {
      await this.emailService.send({
        to: event.email,
        subject: 'Redefinição de senha — Aerobi',
        template: 'password_reset',
        variables: {
          NAME: event.name,
          RESET_URL: resetUrl,
          EXPIRES_AT: formatEmailDate(event.expiresAt),
          IP_ADDRESS: event.ipAddress ?? 'desconhecido',
        },
      });

      this.logger.log(
        `Password reset email sent userId=${event.userId} email=${event.email}`,
      );
    } catch (err) {
      this.logger.error(
        `Falha ao enviar password reset email userId=${event.userId} email=${event.email}: ${getErrorMessage(
          err,
        )}`,
      );
    }
  }
}
