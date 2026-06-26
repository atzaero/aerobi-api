import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { maskEmail } from '@/common/utils/mask-email.util';
import { resolveActorGroupScope } from '@/common/utils/group-scope.util';
import { UserRole } from '@/generated/prisma/client';
import { InviteTokenService } from '@/modules/tokens/services/invite-token.service';

import type { UserResponseDto } from '../dtos/user-response.dto';
import {
  USER_INVITED_EVENT,
  UserInvitedEvent,
} from '../events/user-invited.event';
import { toUserResponse } from '../mappers/user.mapper';
import { UserRepository } from '../repositories/user.repository';
import { isTargetManageableInGroup } from '../utils/group-scope.util';

export interface ResendInviteInput {
  /** Id do user pendente que receberá o novo convite. */
  userId: string;
  /** Id do ator que está reenviando (vem do `@CurrentUser`). */
  actorId: string;
  /** Papel do ator — usado no recorte por role-alvo (ADMIN/COORDINATOR). */
  actorRole: UserRole;
  /** Nome do ator para personalizar o email. */
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
    // Escopo por grupo (espelha o delete do aerobi-web): COORDINATOR só reenvia
    // a OPERATOR/TECHNICAL do próprio grupo (resolvido por consulta — JWT só tem
    // role). Alvo fora do escopo retorna USER_NOT_FOUND (não vaza existência nem
    // o estado do convite); COORDINATOR sem grupo ⇒ FORBIDDEN; ADMIN qualquer.
    const scope = await resolveActorGroupScope(
      input.actorRole,
      input.actorId,
      this.userRepository,
      this.errorMessageService,
    );

    if (scope.kind === 'none') {
      throw new CustomHttpException(
        this.errorMessageService.getMessage(ErrorCode.FORBIDDEN, {
          RESOURCE: 'user',
        }),
        HttpStatus.FORBIDDEN,
        ErrorCode.FORBIDDEN,
      );
    }

    const user = await this.userRepository.findActiveById(input.userId);

    if (
      !user ||
      (scope.kind === 'group' &&
        !isTargetManageableInGroup(user, scope.groupId))
    ) {
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
      `Invite resent userId=${user.id} email=${maskEmail(user.email)} resentBy=${input.actorId}`,
    );

    return toUserResponse(user);
  }
}
