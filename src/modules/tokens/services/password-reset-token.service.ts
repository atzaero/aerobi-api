import { Inject, Injectable, Logger } from '@nestjs/common';

import type { Token } from '@/generated/prisma/client';
import { TokenType } from '@/generated/prisma/enums';

import type { ITokenRepository } from '../repositories/token.repository.interface';
import { TOKEN_REPOSITORY } from '../repositories/token.repository.interface';

import { TokenGenerationService } from './token-generation.service';

/** Resultado da criação de um token: plain (para enviar) + registro persistido. */
export interface TokenCreationResult {
  token: string;
  tokenRecord: Token;
}

/**
 * Serviço para criar / invalidar tokens de **password reset**.
 *
 * Expiração padrão: 30 minutos (fluxo mais sensível que email verification).
 * Antes de emitir um novo token, invalida os anteriores do mesmo subject/type.
 */
@Injectable()
export class PasswordResetTokenService {
  private readonly logger = new Logger(PasswordResetTokenService.name);

  constructor(
    @Inject(TOKEN_REPOSITORY)
    private readonly tokenRepository: ITokenRepository,
    private readonly tokenGeneration: TokenGenerationService,
  ) {}

  async createPasswordResetToken(
    subjectId: string,
    expirationMinutes = 30,
  ): Promise<TokenCreationResult> {
    this.logger.debug(
      `Creating password reset token subjectId=${subjectId} expirationMinutes=${expirationMinutes}`,
    );

    await this.tokenRepository.invalidateBySubjectAndType(
      subjectId,
      TokenType.PASSWORD_RESET,
    );

    const plain = this.tokenGeneration.generatePlainToken();
    const tokenHash = await this.tokenGeneration.hashToken(plain);
    const expiresAt = this.tokenGeneration.computeExpiresAt(expirationMinutes);

    const tokenRecord = await this.tokenRepository.create({
      subjectId,
      type: TokenType.PASSWORD_RESET,
      tokenHash,
      expiresAt,
    });

    this.logger.debug(
      `Password reset token created subjectId=${subjectId} tokenId=${tokenRecord.id} expiresAt=${expiresAt.toISOString()}`,
    );

    return { token: plain, tokenRecord };
  }

  async invalidatePasswordResetTokens(subjectId: string): Promise<void> {
    this.logger.debug(
      `Invalidating password reset tokens subjectId=${subjectId}`,
    );

    await this.tokenRepository.invalidateBySubjectAndType(
      subjectId,
      TokenType.PASSWORD_RESET,
    );
  }
}
