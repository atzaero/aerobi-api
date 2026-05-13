import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { PasswordResetTokenService } from '@/modules/tokens/services/password-reset-token.service';

import type { PasswordResetResponseDto } from '../dtos/password-reset-response.dto';
import type { RequestPasswordResetDto } from '../dtos/request-password-reset.dto';
import {
  PASSWORD_RESET_TOKEN_SENT_EVENT,
  PasswordResetTokenSentEvent,
} from '../events/password-reset-token-sent.event';
import { UserRepository } from '../repositories/user.repository';

const GENERIC_MESSAGE =
  'Se o email estiver registrado, um link de redefinição foi enviado.';

export interface RequestPasswordResetInput extends RequestPasswordResetDto {
  ipAddress?: string;
}

/**
 * Solicita reset de senha. Sempre retorna a mesma mensagem genérica
 * (mesmo se o email não existir) para evitar **user enumeration**.
 *
 * Só emite token + evento se o User existe E está ativo E o convite
 * já foi aceito (`acceptedInviteAt != null`) — usuários pendentes
 * devem usar o link de invite, não reset.
 */
@Injectable()
export class RequestPasswordResetService {
  private readonly logger = new Logger(RequestPasswordResetService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordResetTokenService: PasswordResetTokenService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    input: RequestPasswordResetInput,
  ): Promise<PasswordResetResponseDto> {
    const email = input.email.trim().toLowerCase();
    const user = await this.userRepository.findByEmail(email);

    if (!user || user.deletedAt || !user.acceptedInviteAt) {
      this.logger.debug(
        `Password reset solicitado para email não elegível email=${email}`,
      );
      return { message: GENERIC_MESSAGE };
    }

    const result =
      await this.passwordResetTokenService.createPasswordResetToken(user.id);

    this.eventEmitter.emit(
      PASSWORD_RESET_TOKEN_SENT_EVENT,
      new PasswordResetTokenSentEvent(
        user.id,
        user.email,
        user.name,
        result.token,
        result.tokenRecord.expiresAt,
        input.ipAddress,
      ),
    );

    this.logger.log(`Password reset requested userId=${user.id}`);
    return { message: GENERIC_MESSAGE };
  }
}
