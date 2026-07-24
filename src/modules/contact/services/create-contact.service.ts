import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { httpError } from '@/common/exceptions/http-error.util';
import { getErrorMessage } from '@/common/utils/error.util';

import { CreateContactResponseDTO } from '../dtos/create-contact-response.dto';
import type { CreateContactDTO } from '../dtos/create-contact.dto';
import {
  CONTACT_CREATED_EVENT,
  ContactCreatedEvent,
} from '../events/contact-created.event';
import { buildContactCreateInput } from '../mappers/contact.prisma.mapper';
import {
  CONTACT_REPOSITORY,
  type IContactRepository,
} from '../repositories/contact.repository.interface';
import { EvaluateContactSubmissionGuardsService } from './evaluate-contact-submission-guards.service';

/**
 * Registra mensagem pública do formulário "Fale conosco". Anti-abuso com
 * supressão silenciosa (`null` ⇒ HTTP 202). Rollback se o comprovante falhar.
 */
@Injectable()
export class CreateContactService {
  private readonly logger = new Logger(CreateContactService.name);

  constructor(
    @Inject(CONTACT_REPOSITORY)
    private readonly repo: IContactRepository,
    private readonly guardsService: EvaluateContactSubmissionGuardsService,
    private readonly eventEmitter: EventEmitter2,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(
    dto: CreateContactDTO,
    ipAddress: string | undefined,
  ): Promise<CreateContactResponseDTO | null> {
    const guards = await this.guardsService.execute(dto, ipAddress);
    if (guards.suppressed) {
      return null;
    }

    const created = await this.repo.create(
      buildContactCreateInput(dto, guards),
    );

    let emailSent: boolean;
    try {
      const results = await this.eventEmitter.emitAsync(
        CONTACT_CREATED_EVENT,
        new ContactCreatedEvent(
          created.id,
          guards.normalizedEmail,
          dto.name,
          dto.phone,
          dto.message,
          dto.type,
        ),
      );
      emailSent = results.some((result) => result === true);
    } catch (err) {
      this.logger.error(
        `Contact receipt event failed contactId=${created.id}: ${getErrorMessage(err)}`,
      );
      await this.rollbackCreatedContact(created.id);
      throw httpError(
        this.errorMessageService,
        ErrorCode.EMAIL_SEND_FAILED,
        HttpStatus.BAD_GATEWAY,
        { EMAIL: guards.normalizedEmail },
      );
    }

    if (!emailSent) {
      await this.rollbackCreatedContact(created.id);
      throw httpError(
        this.errorMessageService,
        ErrorCode.EMAIL_SEND_FAILED,
        HttpStatus.BAD_GATEWAY,
        { EMAIL: guards.normalizedEmail },
      );
    }

    return { id: created.id };
  }

  private async rollbackCreatedContact(contactId: string): Promise<void> {
    try {
      await this.repo.hardDelete(contactId);
    } catch (err) {
      this.logger.error(
        `Rollback failed after email error contactId=${contactId}: ${getErrorMessage(err)}`,
      );
    }
  }
}
