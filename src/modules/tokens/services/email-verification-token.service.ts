import { Inject, Injectable, Logger } from '@nestjs/common';

import type { Token } from '@/generated/prisma/client';
import { TokenType } from '@/generated/prisma/enums';

import type { ITokenRepository } from '../repositories/token.repository.interface';
import { TOKEN_REPOSITORY } from '../repositories/token.repository.interface';

import { TokenGenerationService } from './token-generation.service';

/** Resultado da criação de um token: plain (para enviar) + registro persistido. */
export interface TokenCreationResult {
  /** Token plain em base64url — enviar ao destinatário e **não persistir**. */
  token: string;
  /** Registro persistido no banco (contém apenas o hash bcrypt em `tokenHash`). */
  tokenRecord: Token;
}

/**
 * Serviço para criar / invalidar tokens de **verificação de email**.
 *
 * Expiração padrão: 60 minutos. Antes de emitir um novo token, invalida
 * (soft-delete + `used`) todos os anteriores do mesmo subject/type para
 * garantir fluxo one-shot.
 */
@Injectable()
export class EmailVerificationTokenService {
  private readonly logger = new Logger(EmailVerificationTokenService.name);

  constructor(
    @Inject(TOKEN_REPOSITORY)
    private readonly tokenRepository: ITokenRepository,
    private readonly tokenGeneration: TokenGenerationService,
  ) {}

  async createEmailVerificationToken(
    subjectId: string,
    expirationMinutes = 60,
  ): Promise<TokenCreationResult> {
    this.logger.debug(
      `Creating email verification token subjectId=${subjectId} expirationMinutes=${expirationMinutes}`,
    );

    await this.tokenRepository.invalidateBySubjectAndType(
      subjectId,
      TokenType.EMAIL_VERIFICATION,
    );

    const plain = this.tokenGeneration.generatePlainToken();
    const tokenHash = await this.tokenGeneration.hashToken(plain);
    const expiresAt = this.tokenGeneration.computeExpiresAt(expirationMinutes);

    const tokenRecord = await this.tokenRepository.create({
      subjectId,
      type: TokenType.EMAIL_VERIFICATION,
      tokenHash,
      expiresAt,
    });

    this.logger.debug(
      `Email verification token created subjectId=${subjectId} tokenId=${tokenRecord.id} expiresAt=${expiresAt.toISOString()}`,
    );

    return { token: plain, tokenRecord };
  }

  async invalidateEmailVerificationTokens(subjectId: string): Promise<void> {
    this.logger.debug(
      `Invalidating email verification tokens subjectId=${subjectId}`,
    );

    await this.tokenRepository.invalidateBySubjectAndType(
      subjectId,
      TokenType.EMAIL_VERIFICATION,
    );
  }
}
