import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { TokenType } from '@/generated/prisma/enums';
import { RefreshTokenRepository } from '@/modules/auth/repositories/refresh-token.repository';
import { TokenValidationService } from '@/modules/tokens/services/token-validation.service';

import type { ConfirmPasswordResetDto } from '../dtos/confirm-password-reset.dto';
import type { PasswordResetResponseDto } from '../dtos/password-reset-response.dto';
import {
  PASSWORD_RESET_SUCCEEDED_EVENT,
  PasswordResetSucceededEvent,
} from '../events/password-reset-succeeded.event';
import { UserRepository } from '../repositories/user.repository';
import { hashPassword } from '../utils/password-hash.util';

/**
 * Confirma o reset de senha:
 *  1. Resolve user pelo email
 *  2. Valida token tipo PASSWORD_RESET (one-shot)
 *  3. Política mínima da senha + bcrypt-hash
 *  4. Atualiza User.password
 *  5. Marca token como usado
 *  6. **Revoga TODOS os refresh tokens do user** (força re-login)
 *  7. Emite `password-reset.succeeded`
 */
@Injectable()
export class ConfirmPasswordResetService {
  private readonly logger = new Logger(ConfirmPasswordResetService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenValidation: TokenValidationService,

    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly eventEmitter: EventEmitter2,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(
    dto: ConfirmPasswordResetDto,
  ): Promise<PasswordResetResponseDto> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user || user.deletedAt) {
      throw this.invalid();
    }

    let tokenRecord;
    try {
      tokenRecord = await this.tokenValidation.validate(
        dto.token,
        user.id,
        TokenType.PASSWORD_RESET,
      );
    } catch {
      throw this.invalid();
    }

    const passwordHash = await hashPassword(dto.newPassword);

    await this.userRepository.update(user.id, {
      password: passwordHash,
      updatedBy: user.id,
    });

    await this.tokenValidation.markAsUsed(tokenRecord.id, user.id);
    const revoked = await this.refreshTokenRepository.revokeAllForUser(user.id);

    this.eventEmitter.emit(
      PASSWORD_RESET_SUCCEEDED_EVENT,
      new PasswordResetSucceededEvent(user.id, user.email, revoked),
    );

    this.logger.log(
      `Password reset confirmed userId=${user.id} revokedRefreshTokens=${revoked}`,
    );

    return { message: 'Senha redefinida com sucesso.' };
  }

  private invalid(): CustomHttpException {
    return new CustomHttpException(
      this.errorMessageService.getMessage(
        ErrorCode.PASSWORD_RESET_TOKEN_INVALID,
      ),
      HttpStatus.BAD_REQUEST,
      ErrorCode.PASSWORD_RESET_TOKEN_INVALID,
    );
  }
}
