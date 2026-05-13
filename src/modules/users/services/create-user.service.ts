import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { InviteTokenService } from '@/modules/tokens/services/invite-token.service';

import type { CreateUserRequestDto } from '../dtos/create-user-request.dto';
import type { UserResponseDto } from '../dtos/user-response.dto';
import {
  USER_INVITED_EVENT,
  UserInvitedEvent,
} from '../events/user-invited.event';
import { toUserResponse } from '../mappers/user.mapper';
import { UserRepository } from '../repositories/user.repository';

export interface CreateUserInput extends CreateUserRequestDto {
  /** ADMIN que está criando (vem do `@CurrentUser`). */
  actorId: string;
  actorName?: string;
}

/**
 * Cria um User pendente (sem senha) e dispara o fluxo de convite.
 *
 * Apenas ADMIN deve chamar (guard aplicado no controller). Validações:
 *  - Email não pode existir (mesmo soft-deletado) → `EMAIL_ALREADY_REGISTERED`
 *
 * Após persistir, emite Token tipo INVITE e o evento `user.invited` —
 * o listener envia o email com link `${FRONTEND_URL}/accept-invite?...`.
 */
@Injectable()
export class CreateUserService {
  private readonly logger = new Logger(CreateUserService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly inviteTokenService: InviteTokenService,
    private readonly eventEmitter: EventEmitter2,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(input: CreateUserInput): Promise<UserResponseDto> {
    const email = input.email.trim().toLowerCase();

    if (await this.userRepository.existsByEmail(email)) {
      throw new CustomHttpException(
        this.errorMessageService.getMessage(
          ErrorCode.EMAIL_ALREADY_REGISTERED,
          {
            EMAIL: email,
          },
        ),
        HttpStatus.CONFLICT,
        ErrorCode.EMAIL_ALREADY_REGISTERED,
      );
    }

    const now = new Date();
    const user = await this.userRepository.create({
      email,
      name: input.name.trim(),
      role: input.role,
      ...(input.phone !== undefined && { phone: input.phone.trim() }),
      invitedById: input.actorId,
      invitedAt: now,
      createdBy: input.actorId,
    });

    const invite = await this.inviteTokenService.createInviteToken(user.id, {
      role: user.role,
      ...(input.actorName !== undefined && { invitedByName: input.actorName }),
    });

    this.eventEmitter.emit(
      USER_INVITED_EVENT,
      new UserInvitedEvent(
        user.id,
        user.email,
        user.name,
        user.role,
        invite.token,
        invite.tokenRecord.expiresAt,
        input.actorName,
      ),
    );

    this.logger.log(
      `User invited userId=${user.id} email=${user.email} role=${user.role} invitedBy=${input.actorId}`,
    );

    return toUserResponse(user);
  }
}
