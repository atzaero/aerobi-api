import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { EmailService } from '@/common/email/email.service';
import { getErrorMessage } from '@/common/utils/error.util';

import {
  USER_EMAIL_CHANGED_EVENT,
  UserEmailChangedEvent,
} from '../events/user-email-changed.event';

/**
 * Notifica a alteração de email de um usuário em **ambos** os endereços: o
 * antigo (alerta de segurança) e o novo (confirmação). Best-effort — falha de
 * envio é logada e nunca propaga (a alteração já foi persistida). Espelha
 * `send-email-changed-notification.ts` do `aerobi-web`.
 */
@Injectable()
export class UserEmailChangedEmailListener {
  private readonly logger = new Logger(UserEmailChangedEmailListener.name);

  constructor(private readonly emailService: EmailService) {}

  @OnEvent(USER_EMAIL_CHANGED_EVENT)
  async handle(event: UserEmailChangedEvent): Promise<void> {
    const variables = {
      NAME: event.name,
      OLD_EMAIL: event.oldEmail,
      NEW_EMAIL: event.newEmail,
    };

    const results = await Promise.allSettled(
      [event.oldEmail, event.newEmail].map((to) =>
        this.emailService.send({
          to,
          subject: 'Seu email de acesso foi alterado — Aerobi',
          template: 'email_changed',
          variables,
        }),
      ),
    );

    results.forEach((result, index) => {
      const to = index === 0 ? event.oldEmail : event.newEmail;
      if (result.status === 'rejected') {
        this.logger.error(
          `Falha ao notificar troca de email userId=${event.userId} to=${to}: ${getErrorMessage(
            result.reason,
          )}`,
        );
      }
    });

    this.logger.log(
      `Email change notification dispatched userId=${event.userId}`,
    );
  }
}
