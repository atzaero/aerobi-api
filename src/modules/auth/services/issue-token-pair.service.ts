import { Injectable, Logger } from '@nestjs/common';

import type {
  IssuedTokenPair,
  JwtSubject,
  SessionContext,
} from '../interfaces/auth-token.types';
import { RefreshTokenRepository } from '../repositories/refresh-token.repository';
import { hashRefreshToken } from '../utils/refresh-token-hash.util';

import { JwtSignerService } from './jwt-signer.service';

/**
 * Emite um par fresco (access + refresh) **sem rotacionar**. Usado em:
 *  - login bem-sucedido
 *  - aceite de convite (PR 3)
 *
 * Persiste o refresh com hash SHA-256 + `jti` único para que a
 * rotação posterior (em `RotateTokenPairService`) consiga localizar
 * e revogar.
 */
@Injectable()
export class IssueTokenPairService {
  private readonly logger = new Logger(IssueTokenPairService.name);

  constructor(
    private readonly signer: JwtSignerService,

    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async execute(
    subject: JwtSubject,
    context?: SessionContext,
  ): Promise<IssuedTokenPair> {
    const access = this.signer.signAccess(subject);
    const refresh = this.signer.signRefresh(subject);

    const created = await this.refreshTokenRepository.create({
      jti: refresh.jti,
      tokenHash: hashRefreshToken(refresh.token),
      userId: subject.id,
      expiresAt: refresh.expiresAt,
      ...(context?.userAgent !== undefined && { userAgent: context.userAgent }),
      ...(context?.ipAddress !== undefined && { ipAddress: context.ipAddress }),
    });

    this.logger.debug(
      `Issued pair userId=${subject.id} refreshId=${created.id} jti=${refresh.jti}`,
    );

    return {
      accessToken: access.token,
      accessExpiresAt: access.expiresAt,
      refreshToken: refresh.token,
      refreshExpiresAt: refresh.expiresAt,
      refreshTokenId: created.id,
    };
  }
}
