import { Inject, Injectable, Logger } from '@nestjs/common';

import type { Token, UserRole } from '@/generated/prisma/client';
import { TokenType } from '@/generated/prisma/enums';

import type { ITokenRepository } from '../repositories/token.repository.interface';
import { TOKEN_REPOSITORY } from '../repositories/token.repository.interface';

import { TokenGenerationService } from './token-generation.service';

/** Resultado: plain (para enviar por email) + registro persistido (hash). */
export interface InviteTokenCreationResult {
  token: string;
  tokenRecord: Token;
}

/** Metadata armazenada no Token de convite (snapshot da role no momento do envio). */
export interface InviteTokenMetadata {
  role: UserRole;
  invitedByName?: string;
}

/**
 * Tokens de convite para novos usuários (fluxo "ADMIN convida → convidado
 * define senha"). Convenções:
 *
 * - **`subjectId === user.id`** — o User pendente já existe no banco com
 *   `password=null` quando o convite é emitido.
 * - **TTL padrão 72h** — alinhado com `INVITE_TTL_HOURS` em `.env.example`.
 *   O caller pode sobrescrever via `expirationMinutes`.
 * - **One-shot**: emitir um novo convite invalida (`used=true`,
 *   soft-delete) todos os anteriores do mesmo user.
 */
@Injectable()
export class InviteTokenService {
  private readonly logger = new Logger(InviteTokenService.name);

  constructor(
    @Inject(TOKEN_REPOSITORY)
    private readonly tokenRepository: ITokenRepository,
    private readonly tokenGeneration: TokenGenerationService,
  ) {}

  async createInviteToken(
    userId: string,
    metadata: InviteTokenMetadata,
    expirationMinutes = 72 * 60,
  ): Promise<InviteTokenCreationResult> {
    this.logger.debug(
      `Creating invite token userId=${userId} role=${metadata.role} expirationMinutes=${expirationMinutes}`,
    );

    await this.tokenRepository.invalidateBySubjectAndType(
      userId,
      TokenType.INVITE,
    );

    const plain = this.tokenGeneration.generatePlainToken();
    const tokenHash = await this.tokenGeneration.hashToken(plain);
    const expiresAt = this.tokenGeneration.computeExpiresAt(expirationMinutes);

    const tokenRecord = await this.tokenRepository.create({
      subjectId: userId,
      type: TokenType.INVITE,
      tokenHash,
      expiresAt,
      metadata: { ...metadata },
    });

    this.logger.debug(
      `Invite token created userId=${userId} tokenId=${tokenRecord.id} expiresAt=${expiresAt.toISOString()}`,
    );

    return { token: plain, tokenRecord };
  }

  async invalidateInviteTokens(userId: string): Promise<void> {
    this.logger.debug(`Invalidating invite tokens userId=${userId}`);
    await this.tokenRepository.invalidateBySubjectAndType(
      userId,
      TokenType.INVITE,
    );
  }
}
