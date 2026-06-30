import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { resolveActorGroupScope } from '@/common/utils/group-scope.util';
import type { User } from '@/generated/prisma/client';
import { RefreshTokenRepository } from '@/modules/auth/repositories/refresh-token.repository';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import type { AdminUpdateUserRequestDto } from '../dtos/admin-update-user-request.dto';
import type { UserResponseDto } from '../dtos/user-response.dto';
import {
  USER_EMAIL_CHANGED_EVENT,
  UserEmailChangedEvent,
} from '../events/user-email-changed.event';
import { toUserResponse } from '../mappers/user.mapper';
import { UserRepository } from '../repositories/user.repository';
import { isTargetEditableInGroup } from '../utils/group-scope.util';
import { assertCanAssignRole } from '../utils/user-access.util';

/**
 * Detecta violação de unicidade do Prisma (P2002) sem acoplar ao tipo do client
 * gerado. Protege a troca de email contra a corrida entre `existsByEmail` e o
 * `update`: a constraint `@unique` do banco é a garantia final.
 */
function isUniqueConstraintError(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    (err as { code?: unknown }).code === 'P2002'
  );
}

/**
 * Edição **administrativa** de um usuário (`PATCH /users/:id`) — espelha a action
 * `update` do `aerobi-web`. A auto-edição (self) vive em `UpdateProfileService`
 * (`PATCH /users/me`); aqui o ator gere **outro** usuário.
 *
 * Autorização em duas camadas: o `PermissionsGuard` (`user:edit`) deixa passar
 * ADMIN/COORDINATOR; aqui aplica-se o **escopo por grupo** (COORDINATOR só edita
 * `OPERATOR`/`TECHNICAL`/`COORDINATOR` do **próprio grupo**, nunca ADMIN — fora do
 * escopo responde `USER_NOT_FOUND`, sem vazar existência) e o recorte de **role
 * atribuível** (COORDINATOR nunca promove a ADMIN).
 *
 * Troca de `email`: valida unicidade (`EMAIL_ALREADY_REGISTERED`), revoga todos
 * os refresh tokens do alvo e emite `user.email.changed` (notifica os dois
 * endereços, best-effort). `emailVerified` **não** é redefinido: o admin é a
 * autoridade que afirma o novo endereço e a notificação a ambos cobre o titular.
 */
@Injectable()
export class UpdateUserService {
  private readonly logger = new Logger(UpdateUserService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly eventEmitter: EventEmitter2,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(
    id: string,
    dto: AdminUpdateUserRequestDto,
    actor: AuthenticatedUser,
  ): Promise<UserResponseDto> {
    const target = await this.userRepository.findActiveById(id);

    const scope = await resolveActorGroupScope(
      actor.role,
      actor.id,
      this.userRepository,
      this.errorMessageService,
    );

    /** COORDINATOR sem grupo provisionado não gere ninguém — sem "fail open". */
    if (scope.kind === 'none') {
      throw new CustomHttpException(
        this.errorMessageService.getMessage(ErrorCode.FORBIDDEN, {
          RESOURCE: 'user',
        }),
        HttpStatus.FORBIDDEN,
        ErrorCode.FORBIDDEN,
      );
    }

    /**
     * Alvo precisa existir e ser gerível pelo ator. COORDINATOR: editável no
     * próprio grupo (operator/technical/coordinator). Fora do escopo ou
     * inexistente ⇒ mesmo 404 (não distingue inexistente de fora-do-escopo).
     */
    const manageable =
      scope.kind === 'group'
        ? !!target && isTargetEditableInGroup(target, scope.groupId)
        : !!target;
    if (!target || !manageable) {
      throw new CustomHttpException(
        this.errorMessageService.getMessage(ErrorCode.USER_NOT_FOUND, {
          ID: id,
        }),
        HttpStatus.NOT_FOUND,
        ErrorCode.USER_NOT_FOUND,
      );
    }

    if (dto.role !== undefined && dto.role !== target.role) {
      assertCanAssignRole(actor.role, dto.role, this.errorMessageService);
    }

    /** `email` já chega normalizado (trim + lowercase) pelo DTO. */
    const emailChanged = dto.email !== undefined && dto.email !== target.email;
    if (emailChanged && (await this.userRepository.existsByEmail(dto.email!))) {
      throw new CustomHttpException(
        this.errorMessageService.getMessage(
          ErrorCode.EMAIL_ALREADY_REGISTERED,
          {
            EMAIL: dto.email!,
          },
        ),
        HttpStatus.CONFLICT,
        ErrorCode.EMAIL_ALREADY_REGISTERED,
      );
    }

    let updated: User;
    try {
      updated = await this.userRepository.update(id, {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(emailChanged && { email: dto.email }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.role !== undefined && { role: dto.role }),
        updatedBy: actor.id,
      });
    } catch (err) {
      /** Corrida com outro cadastro do mesmo email: a constraint @unique vence. */
      if (emailChanged && isUniqueConstraintError(err)) {
        throw new CustomHttpException(
          this.errorMessageService.getMessage(
            ErrorCode.EMAIL_ALREADY_REGISTERED,
            { EMAIL: dto.email! },
          ),
          HttpStatus.CONFLICT,
          ErrorCode.EMAIL_ALREADY_REGISTERED,
        );
      }
      throw err;
    }

    if (emailChanged) {
      const revoked = await this.refreshTokenRepository.revokeAllForUser(id);
      this.eventEmitter.emit(
        USER_EMAIL_CHANGED_EVENT,
        new UserEmailChangedEvent(
          id,
          updated.name,
          target.email,
          updated.email,
        ),
      );
      this.logger.log(
        `User email changed id=${id} revokedRefreshTokens=${revoked} updatedBy=${actor.id}`,
      );
    }

    this.logger.log(`User updated (admin) id=${id} updatedBy=${actor.id}`);
    return toUserResponse(updated);
  }
}
