import { HttpStatus, Injectable } from '@nestjs/common';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { httpError } from '@/common/exceptions/http-error.util';
import { resolveActorGroupScope } from '@/common/utils/group-scope.util';
import { UserRole } from '@/generated/prisma/client';

import { can } from '@/modules/auth/permissions/permissions';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import type { UserResponseDto } from '../dtos/user-response.dto';
import { toUserResponse } from '../mappers/user.mapper';
import { UserRepository } from '../repositories/user.repository';

/**
 * Leitura de um usuário por id, escopada (espelha `aerobi-web`
 * `app/actions/users/get-by-id`):
 *  - **self** lê o próprio perfil (qualquer papel);
 *  - **ADMIN** lê qualquer um;
 *  - **COORDINATOR** (com `user:read`) lê apenas membros do **próprio grupo**.
 *
 * Fora desses casos responde `USER_NOT_FOUND` (mesmo status do inexistente) para
 * não vazar a existência de usuários fora do escopo do ator.
 */
@Injectable()
export class FindUserByIdService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(
    id: string,
    actor: AuthenticatedUser,
  ): Promise<UserResponseDto> {
    const user = await this.userRepository.findActiveById(id);

    const isSelf = actor.id === id;
    const isAdmin = actor.role === UserRole.ADMIN;

    if (user && (isSelf || isAdmin)) {
      return toUserResponse(user);
    }

    /**
     * Demais casos (tipicamente COORDINATOR): exige permissão de leitura
     * administrativa **e** alvo dentro do próprio grupo. Qualquer falha vira o
     * mesmo 404 — não distinguimos inexistente de fora-do-escopo.
     */
    if (user && can(actor.role, 'user', 'read')) {
      const scope = await resolveActorGroupScope(
        actor.role,
        actor.id,
        this.userRepository,
        this.errorMessageService,
      );
      if (scope.kind === 'group' && user.groupId === scope.groupId) {
        return toUserResponse(user);
      }
    }

    throw httpError(
      this.errorMessageService,
      ErrorCode.USER_NOT_FOUND,
      HttpStatus.NOT_FOUND,
      { ID: id },
    );
  }
}
