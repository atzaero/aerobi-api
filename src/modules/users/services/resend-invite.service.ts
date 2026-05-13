import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { InviteTokenService } from '@/modules/tokens/services/invite-token.service';

import type { UserResponseDto } from '../dtos/user-response.dto';
import {
  USER_INVITED_EVENT,
  UserInvitedEvent,
} from '../events/user-invited.event';
import { toUserResponse } from '../mappers/user.mapper';
import { UserRepository } from '../repositories/user.repository';

export interface ResendInviteInput {
  /** Id do user pendente que receberá o novo convite. */
  userId: string;
  /** Id do ADMIN que está reenviando (vem do `@CurrentUser`). */
  actorId: string;
  /** Nome do ADMIN para personalizar o email. */
  actorName?: string;
}

/**
 * Reemite o convite de um User que ainda não aceitou (email perdido,
 * link expirado, etc).
 *
 * Validações:
 *  - User existe e está ativo → caso contrário `USER_NOT_FOUND`
 *  - Convite ainda não foi aceito → caso contrário `INVITE_ALREADY_ACCEPTED`
 *
 * `InviteTokenService.createInviteToken` é idempotente: invalida
 * (soft-delete + `used`) os convites anteriores do mesmo user e emite
 * um novo. O `user.invitedAt` permanece com a data do convite original
 * (audit "quando foi convidado pela primeira vez"); o registro do
 * reenvio fica no Token novo.
 */
@Injectable()
export class ResendInviteService {
  private readonly logger = new Logger(ResendInviteService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly inviteTokenService: InviteTokenService,
    private readonly eventEmitter: EventEmitter2,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(input: ResendInviteInput): Promise<UserResponseDto> {
    const user = await this.userRepository.findActiveById(input.userId);

    if (!user) {
      throw new CustomHttpException(
        this.errorMessageService.getMessage(ErrorCode.USER_NOT_FOUND, {
          ID: input.userId,
        }),
        HttpStatus.NOT_FOUND,
        ErrorCode.USER_NOT_FOUND,
      );
    }

    if (user.acceptedInviteAt) {
      throw new CustomHttpException(
        this.errorMessageService.getMessage(ErrorCode.INVITE_ALREADY_ACCEPTED),
        HttpStatus.CONFLICT,
        ErrorCode.INVITE_ALREADY_ACCEPTED,
      );
    }

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
      `Invite resent userId=${user.id} email=${user.email} resentBy=${input.actorId}`,
    );

    return toUserResponse(user);
  }
}
