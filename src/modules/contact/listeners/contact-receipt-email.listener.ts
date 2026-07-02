import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { EmailService } from '@/common/email/email.service';
import { getErrorMessage } from '@/common/utils/error.util';
import { maskEmail } from '@/common/utils/mask-email.util';

import {
  CONTACT_CREATED_EVENT,
  ContactCreatedEvent,
} from '../events/contact-created.event';
import { CONTACT_TYPE_LABELS } from '../utils/contact-labels.util';

@Injectable()
export class ContactReceiptEmailListener {
  private readonly logger = new Logger(ContactReceiptEmailListener.name);

  constructor(private readonly emailService: EmailService) {}

  @OnEvent(CONTACT_CREATED_EVENT)
  async handle(event: ContactCreatedEvent): Promise<boolean> {
    try {
      const sent = await this.emailService.send({
        to: event.email,
        subject: 'Comprovante — sua mensagem para o Aerobi',
        template: 'contact_receipt',
        variables: {
          NAME: event.name,
          EMAIL: event.email,
          PHONE: event.phone,
          TYPE_LABEL: CONTACT_TYPE_LABELS[event.type] ?? event.type,
          MESSAGE: event.message,
        },
      });

      if (sent) {
        this.logger.log(
          `Contact receipt email sent contactId=${event.contactId} email=${maskEmail(event.email)}`,
        );
      }

      return sent;
    } catch (err) {
      this.logger.error(
        `Falha ao enviar comprovante contactId=${event.contactId} email=${maskEmail(event.email)}: ${getErrorMessage(
          err,
        )}`,
      );
      return false;
    }
  }
}
