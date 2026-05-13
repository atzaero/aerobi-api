import { HttpStatus, Inject, Injectable } from '@nestjs/common';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { TokenType } from '@/generated/prisma/enums';
import { TokenValidationService } from '@/modules/tokens/services/token-validation.service';

import type { VerifyPasswordResetTokenDto } from '../dtos/verify-password-reset-token.dto';
import {
  USER_REPOSITORY,
  type IUserRepository,
} from '../repositories/user.repository.interface';

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
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly tokenValidation: TokenValidationService,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(dto: VerifyPasswordResetTokenDto): Promise<{ valid: boolean }> {
    const email = dto.email.trim().toLowerCase();
    const user = await this.userRepository.findByEmail(email);
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
    return new CustomHttpException(
      this.errorMessageService.getMessage(
        ErrorCode.PASSWORD_RESET_TOKEN_INVALID,
      ),
      HttpStatus.BAD_REQUEST,
      ErrorCode.PASSWORD_RESET_TOKEN_INVALID,
    );
  }
}
