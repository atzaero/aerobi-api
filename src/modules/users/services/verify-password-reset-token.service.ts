import { HttpStatus, Injectable } from '@nestjs/common';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { httpError } from '@/common/exceptions/http-error.util';
import { TokenType } from '@/generated/prisma/enums';
import { TokenValidationService } from '@/modules/tokens/services/token-validation.service';

import type { VerifyPasswordResetTokenDto } from '../dtos/verify-password-reset-token.dto';
import { UserRepository } from '../repositories/user.repository';

/**
 * Valida o token de reset SEM consumi-lo — útil para que o frontend
 * mostre a página de "definir nova senha" apenas se o token é válido.
 *
 * Retorna `{ valid: true }` em sucesso; lança `PASSWORD_RESET_TOKEN_INVALID`
 * caso contrário.
 */
@Injectable()
export class VerifyPasswordResetTokenService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenValidation: TokenValidationService,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(dto: VerifyPasswordResetTokenDto): Promise<{ valid: boolean }> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user || user.deletedAt) {
      throw this.invalid();
    }

    try {
      await this.tokenValidation.validate(
        dto.token,
        user.id,
        TokenType.PASSWORD_RESET,
      );
    } catch {
      throw this.invalid();
    }

    return { valid: true };
  }

  private invalid(): CustomHttpException {
    return httpError(
      this.errorMessageService,
      ErrorCode.PASSWORD_RESET_TOKEN_INVALID,
      HttpStatus.BAD_REQUEST,
    );
  }
}
