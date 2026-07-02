import { HttpStatus, Inject, Injectable } from '@nestjs/common';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { httpError } from '@/common/exceptions/http-error.util';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { ContactIdResponseDTO } from '../dtos/update-contact-status.dto';
import {
  CONTACT_REPOSITORY,
  type IContactRepository,
} from '../repositories/contact.repository.interface';

@Injectable()
export class RemoveContactService {
  constructor(
    @Inject(CONTACT_REPOSITORY)
    private readonly repo: IContactRepository,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(
    id: string,
    actor: AuthenticatedUser,
  ): Promise<ContactIdResponseDTO> {
    const existing = await this.repo.findByIdActive(id);
    if (!existing) {
      throw httpError(
        this.errorMessageService,
        ErrorCode.RESOURCE_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        { RESOURCE: 'Mensagem de contato', ID: id },
      );
    }

    await this.repo.softDelete(id, actor.id);
    return { id };
  }
}
