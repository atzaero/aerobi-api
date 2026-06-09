import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { maskEmail } from '@/common/utils/mask-email.util';
import { Uf, UserRole } from '@/generated/prisma/client';
import { InviteTokenService } from '@/modules/tokens/services/invite-token.service';

import type { CreateUserRequestDto } from '../dtos/create-user-request.dto';
import type { UserResponseDto } from '../dtos/user-response.dto';
import {
  USER_INVITED_EVENT,
  UserInvitedEvent,
} from '../events/user-invited.event';
import { toUserResponse } from '../mappers/user.mapper';
import { UserRepository } from '../repositories/user.repository';
import { assertCanManageTargetRole } from '../utils/user-access.util';

export interface CreateUserInput extends CreateUserRequestDto {
  /** Ator que está criando (vem do `@CurrentUser`). */
  actorId: string;
  /** Papel do ator — usado no recorte por role-alvo (ADMIN/COORDINATOR). */
  actorRole: UserRole;
  actorName?: string;
}

/**
 * Cria um User pendente (sem senha) e dispara o fluxo de convite.
 *
 * Autorização em duas camadas: o `PermissionsGuard` (`user:create`) deixa
 * passar ADMIN/COORDINATOR; aqui aplica-se o **recorte por role-alvo**
 * (coordinator só cria `OPERATOR`/`TECHNICAL`). Validações:
 *  - Ator pode gerir a role alvo → caso contrário `FORBIDDEN`
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
    assertCanManageTargetRole(
      input.actorRole,
      input.role,
      this.errorMessageService,
    );

    const { aerodromeGroupId, state } = await this.resolveGroupAndState(input);

    if (await this.userRepository.existsByEmail(input.email)) {
      throw new CustomHttpException(
        this.errorMessageService.getMessage(
          ErrorCode.EMAIL_ALREADY_REGISTERED,
          { EMAIL: input.email },
        ),
        HttpStatus.CONFLICT,
        ErrorCode.EMAIL_ALREADY_REGISTERED,
      );
    }

    const now = new Date();
    const user = await this.userRepository.create({
      email: input.email,
      name: input.name,
      role: input.role,
      aerodromeGroupId,
      state,
      ...(input.phone !== undefined && { phone: input.phone }),
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
      `User invited userId=${user.id} email=${maskEmail(user.email)} role=${user.role} invitedBy=${input.actorId}`,
    );

    return toUserResponse(user);
  }

  /**
   * Resolve o grupo/UF do novo user, espelhando `aerobi-web`
   * (`app/actions/users/create`), com a tradução da sentinela `"admin"` do
   * Firestore para `null` no Postgres (decisão da #210):
   *  - role alvo ADMIN → sem grupo/UF (`null`/`null`);
   *  - ator COORDINATOR → herda o **próprio** grupo/UF (resolvidos por consulta;
   *    o JWT só carrega role). Sem grupo/UF provisionado ⇒ `FORBIDDEN`;
   *  - ator ADMIN (criando role com grupo) → grupo/UF vêm do DTO; ausentes ⇒
   *    `VALIDATION_FAILED` (400).
   */
  private async resolveGroupAndState(
    input: CreateUserInput,
  ): Promise<{ aerodromeGroupId: string | null; state: Uf | null }> {
    if (input.role === UserRole.ADMIN) {
      return { aerodromeGroupId: null, state: null };
    }

    if (input.actorRole === UserRole.COORDINATOR) {
      const actorRecord = await this.userRepository.findActiveById(
        input.actorId,
      );
      if (!actorRecord?.aerodromeGroupId || !actorRecord.state) {
        throw new CustomHttpException(
          this.errorMessageService.getMessage(ErrorCode.FORBIDDEN, {
            RESOURCE: 'user',
          }),
          HttpStatus.FORBIDDEN,
          ErrorCode.FORBIDDEN,
        );
      }
      return {
        aerodromeGroupId: actorRecord.aerodromeGroupId,
        state: actorRecord.state,
      };
    }

    if (!input.aerodromeGroupId || !input.state) {
      throw new CustomHttpException(
        this.errorMessageService.getMessage(ErrorCode.VALIDATION_FAILED),
        HttpStatus.BAD_REQUEST,
        ErrorCode.VALIDATION_FAILED,
      );
    }
    return { aerodromeGroupId: input.aerodromeGroupId, state: input.state };
  }
}
