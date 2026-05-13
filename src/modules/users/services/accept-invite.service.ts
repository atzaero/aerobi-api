import { HttpStatus, Injectable, Logger } from '@nestjs/common';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { maskEmail } from '@/common/utils/mask-email.util';
import { TokenType } from '@/generated/prisma/enums';
import { IssueTokenPairService } from '@/modules/auth/services/issue-token-pair.service';
import { TokenValidationService } from '@/modules/tokens/services/token-validation.service';

import type { AcceptInviteRequestDto } from '../dtos/accept-invite-request.dto';
import type { AcceptInviteResponseDto } from '../dtos/accept-invite-response.dto';
import { toUserResponse } from '../mappers/user.mapper';
import { UserRepository } from '../repositories/user.repository';
import { hashPassword } from '../utils/password-hash.util';

export interface AcceptInviteInput extends AcceptInviteRequestDto {
  userAgent?: string;
  ipAddress?: string;
}

/**
 * Conclui o onboarding do convite:
 *  1. Resolve o usuário pelo email (informado junto ao token na URL).
 *  2. Valida o token (tipo INVITE) para esse subjectId/userId.
 *  3. Verifica que o convite ainda não foi aceito (`acceptedInviteAt == null`).
 *  4. Aplica política de senha + bcrypt-hash.
 *  5. Atualiza User: `password`, `emailVerified=true`, `acceptedInviteAt=now`.
 *  6. Marca token como usado.
 *  7. Emite par JWT (já logado).
 */
@Injectable()
export class AcceptInviteService {
  private readonly logger = new Logger(AcceptInviteService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenValidation: TokenValidationService,
    private readonly issueTokenPair: IssueTokenPairService,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(input: AcceptInviteInput): Promise<AcceptInviteResponseDto> {
    const user = await this.userRepository.findByEmail(input.email);

    if (!user || user.deletedAt) {
      throw new CustomHttpException(
        this.errorMessageService.getMessage(ErrorCode.INVITE_TOKEN_INVALID),
        HttpStatus.BAD_REQUEST,
        ErrorCode.INVITE_TOKEN_INVALID,
      );
    }

    if (user.acceptedInviteAt) {
      throw new CustomHttpException(
        this.errorMessageService.getMessage(ErrorCode.INVITE_ALREADY_ACCEPTED),
        HttpStatus.BAD_REQUEST,
        ErrorCode.INVITE_ALREADY_ACCEPTED,
      );
    }

    let tokenRecord;
    try {
      tokenRecord = await this.tokenValidation.validate(
        input.token,
        user.id,
        TokenType.INVITE,
      );
    } catch (err) {
      // Traduz códigos genéricos do TokenValidationService para os
      // específicos de INVITE (mensagens com contexto melhor para o user).
      if (err instanceof CustomHttpException) {
        const original = err.getErrorCode();
        if (original === ErrorCode.TOKEN_EXPIRED) {
          throw new CustomHttpException(
            this.errorMessageService.getMessage(ErrorCode.INVITE_TOKEN_EXPIRED),
            HttpStatus.BAD_REQUEST,
            ErrorCode.INVITE_TOKEN_EXPIRED,
          );
        }
        if (
          original === ErrorCode.INVALID_TOKEN ||
          original === ErrorCode.TOKEN_ALREADY_USED
        ) {
          throw new CustomHttpException(
            this.errorMessageService.getMessage(ErrorCode.INVITE_TOKEN_INVALID),
            HttpStatus.BAD_REQUEST,
            ErrorCode.INVITE_TOKEN_INVALID,
          );
        }
      }
      throw err;
    }

    const passwordHash = await hashPassword(input.password);
    const now = new Date();

    const updated = await this.userRepository.update(user.id, {
      password: passwordHash,
      emailVerified: true,
      acceptedInviteAt: now,
      ...(input.name !== undefined && { name: input.name }),
      updatedBy: user.id,
    });

    await this.tokenValidation.markAsUsed(tokenRecord.id, user.id);

    const pair = await this.issueTokenPair.execute(
      { id: updated.id, email: updated.email, role: updated.role },
      {
        ...(input.userAgent !== undefined && { userAgent: input.userAgent }),
        ...(input.ipAddress !== undefined && { ipAddress: input.ipAddress }),
      },
    );

    this.logger.log(
      `Invite accepted userId=${updated.id} email=${maskEmail(updated.email)}`,
    );

    const response = toUserResponse(updated);
    return {
      accessToken: pair.accessToken,
      accessExpiresAt: pair.accessExpiresAt.toISOString(),
      refreshToken: pair.refreshToken,
      refreshExpiresAt: pair.refreshExpiresAt.toISOString(),
      user: {
        id: response.id,
        email: response.email,
        name: response.name,
        role: response.role,
      },
    };
  }
}
