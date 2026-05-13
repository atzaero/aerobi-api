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
 * Rotação atômica: emite par novo + revoga o anterior + linka
 * `replaced_by_id` em uma única transação (delegada ao repository).
 *
 * O caller (`AuthRefreshSessionService`) é responsável por validar
 * que o refresh apresentado **está apto a rotacionar** antes de
 * invocar este service — em particular, conferir hash e detectar
 * reuso de refresh já revogado.
 */
@Injectable()
export class RotateTokenPairService {
  private readonly logger = new Logger(RotateTokenPairService.name);

  constructor(
    private readonly signer: JwtSignerService,

    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async execute(
    currentRefreshTokenId: string,
    subject: JwtSubject,
    context?: SessionContext,
  ): Promise<IssuedTokenPair> {
    const access = this.signer.signAccess(subject);
    const refresh = this.signer.signRefresh(subject);

    const created = await this.refreshTokenRepository.rotate({
      currentId: currentRefreshTokenId,
      newToken: {
        jti: refresh.jti,
        tokenHash: hashRefreshToken(refresh.token),
        userId: subject.id,
        expiresAt: refresh.expiresAt,
        ...(context?.userAgent !== undefined && {
          userAgent: context.userAgent,
        }),
        ...(context?.ipAddress !== undefined && {
          ipAddress: context.ipAddress,
        }),
      },
    });

    this.logger.debug(
      `Rotated pair userId=${subject.id} oldId=${currentRefreshTokenId} newId=${created.id} newJti=${refresh.jti}`,
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
