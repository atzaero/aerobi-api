import { HttpStatus, Injectable, Logger } from '@nestjs/common';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { RefreshTokenRepository } from '@/modules/auth/repositories/refresh-token.repository';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { UserRepository } from '../repositories/user.repository';
import { assertCanManageTargetRole } from '../utils/user-access.util';

/**
 * Soft-delete de User (`deletedAt`). Garante que todos os refresh
 * tokens do user sejam revogados — caso contrário, sessões existentes
 * continuariam a poder rotacionar mesmo após o "delete".
 *
 * Autorização em duas camadas: o `PermissionsGuard` (`user:delete`) deixa
 * passar ADMIN/COORDINATOR; aqui aplica-se o **recorte por role-alvo**
 * (coordinator só remove `OPERATOR`/`TECHNICAL`).
 */
@Injectable()
export class RemoveUserService {
  private readonly logger = new Logger(RemoveUserService.name);

  constructor(
    private readonly userRepository: UserRepository,

    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(id: string, actor: AuthenticatedUser): Promise<void> {
    const user = await this.userRepository.findActiveById(id);
    if (!user) {
      throw new CustomHttpException(
        this.errorMessageService.getMessage(ErrorCode.USER_NOT_FOUND, {
          ID: id,
        }),
        HttpStatus.NOT_FOUND,
        ErrorCode.USER_NOT_FOUND,
      );
    }

    assertCanManageTargetRole(actor.role, user.role, this.errorMessageService);

    await this.userRepository.softDelete(id, actor.id);
    const revoked = await this.refreshTokenRepository.revokeAllForUser(id);

    this.logger.log(
      `User soft-deleted id=${id} revokedRefreshTokens=${revoked} deletedBy=${actor.id}`,
    );
  }
}
