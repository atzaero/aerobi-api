import { HttpStatus, Injectable, Logger } from '@nestjs/common';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { RefreshTokenRepository } from '@/modules/auth/repositories/refresh-token.repository';

import { UserRepository } from '../repositories/user.repository';

/**
 * Soft-delete de User (`deletedAt`). Garante que todos os refresh
 * tokens do user sejam revogados — caso contrário, sessões existentes
 * continuariam a poder rotacionar mesmo após o "delete".
 *
 * Apenas ADMIN deve chamar (guard aplicado no controller).
 */
@Injectable()
export class RemoveUserService {
  private readonly logger = new Logger(RemoveUserService.name);

  constructor(
    private readonly userRepository: UserRepository,

    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(id: string, actorId: string): Promise<void> {
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

    await this.userRepository.softDelete(id, actorId);
    const revoked = await this.refreshTokenRepository.revokeAllForUser(id);

    this.logger.log(
      `User soft-deleted id=${id} revokedRefreshTokens=${revoked} deletedBy=${actorId}`,
    );
  }
}
