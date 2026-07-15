import { HttpStatus, Injectable, Logger } from '@nestjs/common';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { httpError } from '@/common/exceptions/http-error.util';
import { resolveActorGroupScope } from '@/common/utils/group-scope.util';
import { AuditAction } from '@/generated/prisma/client';
import { AuditRecorderService } from '@/modules/audit/services/audit-recorder.service';
import type { RecordAuditContext } from '@/modules/audit/services/audit-recorder.service';
import { RefreshTokenRepository } from '@/modules/auth/repositories/refresh-token.repository';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { UserRepository } from '../repositories/user.repository';
import { userAuditSnapshot } from '../utils/user-audit';
import { isTargetManageableInGroup } from '../utils/group-scope.util';

/**
 * Soft-delete de User (`deletedAt`). Garante que todos os refresh tokens do user
 * sejam revogados — caso contrário, sessões existentes continuariam a poder
 * rotacionar mesmo após o "delete".
 *
 * Autorização (espelha `aerobi-web` `app/actions/users/delete`):
 *  - `PermissionsGuard` (`user:delete`) deixa passar ADMIN/COORDINATOR;
 *  - bloqueia **auto-exclusão**;
 *  - **escopo por grupo** resolvido por consulta (o JWT só carrega role):
 *    COORDINATOR só remove `OPERATOR`/`TECHNICAL` do **próprio grupo** — alvo
 *    fora do escopo retorna `USER_NOT_FOUND` (mesmo status do inexistente, para
 *    não vazar a existência); COORDINATOR sem grupo ⇒ `FORBIDDEN`; ADMIN remove
 *    qualquer um.
 */
@Injectable()
export class RemoveUserService {
  private readonly logger = new Logger(RemoveUserService.name);

  constructor(
    private readonly userRepository: UserRepository,

    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly errorMessageService: ErrorMessageService,
    private readonly auditRecorder: AuditRecorderService,
  ) {}

  async execute(
    id: string,
    actor: AuthenticatedUser,
    auditContext: RecordAuditContext = {},
  ): Promise<void> {
    if (id === actor.id) {
      throw httpError(
        this.errorMessageService,
        ErrorCode.VALIDATION_FAILED,
        HttpStatus.BAD_REQUEST,
        { DETAILS: 'não é permitido remover o próprio usuário' },
      );
    }

    const scope = await resolveActorGroupScope(
      actor.role,
      actor.id,
      this.userRepository,
      this.errorMessageService,
    );

    if (scope.kind === 'none') {
      throw httpError(
        this.errorMessageService,
        ErrorCode.FORBIDDEN,
        HttpStatus.FORBIDDEN,
        { RESOURCE: 'user' },
      );
    }

    const user = await this.userRepository.findActiveById(id);

    // COORDINATOR: alvo precisa ser gerível no próprio grupo; senão 404 (não
    // distingue inexistente de fora-do-escopo). ADMIN: basta existir.
    const notFound =
      scope.kind === 'group'
        ? !user || !isTargetManageableInGroup(user, scope.groupId)
        : !user;
    if (notFound) {
      throw httpError(
        this.errorMessageService,
        ErrorCode.USER_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        { ID: id },
      );
    }

    await this.userRepository.softDelete(id, actor.id);
    const revoked = await this.refreshTokenRepository.revokeAllForUser(id);

    this.logger.log(
      `User soft-deleted id=${id} revokedRefreshTokens=${revoked} deletedBy=${actor.id}`,
    );

    await this.auditRecorder.record(
      {
        action: AuditAction.DELETE,
        entityType: 'user',
        entityId: id,
        before: userAuditSnapshot(user!),
      },
      auditContext,
    );
  }
}
