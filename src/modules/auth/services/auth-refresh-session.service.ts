import { HttpStatus, Injectable, Logger } from '@nestjs/common';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import type { UserRole } from '@/generated/prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

import type {
  IssuedTokenPair,
  SessionContext,
} from '../interfaces/auth-token.types';
import { RefreshTokenRepository } from '../repositories/refresh-token.repository';
import { hashRefreshToken } from '../utils/refresh-token-hash.util';

import { JwtVerifierService } from './jwt-verifier.service';
import { RotateTokenPairService } from './rotate-token-pair.service';

export interface RefreshSessionInput {
  refreshToken: string;
  context?: SessionContext;
}

export interface RefreshSessionResult extends IssuedTokenPair {
  user: { id: string; email: string; name: string; role: UserRole };
}

/**
 * Caso de uso: rotacionar um refresh token.
 *
 * Fluxo:
 *  1. Verifica assinatura RS256 + expiração do JWT (`AuthTokenService`).
 *  2. Busca o registro no DB por `jti`.
 *  3. Confere o hash SHA-256 (defense-in-depth contra DB sem private key).
 *  4. Se o registro já está revogado → **REUSE DETECTED**: revoga toda
 *     a família do usuário e lança 401 com código próprio.
 *  5. Confirma estado do usuário (existe, não deletado).
 *  6. Emite par novo via rotação atômica (cria novo + revoga atual +
 *     linka `replaced_by_id` numa transação).
 */
@Injectable()
export class AuthRefreshSessionService {
  private readonly logger = new Logger(AuthRefreshSessionService.name);

  constructor(
    private readonly jwtVerifier: JwtVerifierService,
    private readonly rotateTokenPair: RotateTokenPairService,
    private readonly prisma: PrismaService,
    private readonly errorMessageService: ErrorMessageService,

    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async execute({
    refreshToken,
    context,
  }: RefreshSessionInput): Promise<RefreshSessionResult> {
    const payload = this.jwtVerifier.verifyRefreshToken(refreshToken);

    const record = await this.refreshTokenRepository.findByJti(payload.jti);
    if (!record) {
      this.logger.debug(`Refresh failed — jti not found jti=${payload.jti}`);
      throw this.fail(ErrorCode.REFRESH_TOKEN_INVALID);
    }

    const expectedHash = hashRefreshToken(refreshToken);
    if (record.tokenHash !== expectedHash) {
      this.logger.warn(
        `Refresh failed — hash mismatch jti=${payload.jti} userId=${record.userId}`,
      );
      throw this.fail(ErrorCode.REFRESH_TOKEN_INVALID);
    }

    if (record.deletedAt) {
      throw this.fail(ErrorCode.REFRESH_TOKEN_INVALID);
    }

    if (record.revoked) {
      // Reuso: alguém apresentou um refresh já trocado por outro.
      // Pode ser legitimate race condition (clock skew, retry) ou
      // sequestro. Por segurança, revoga toda a família e força re-login.
      const revokedCount = await this.refreshTokenRepository.revokeAllForUser(
        record.userId,
      );
      this.logger.warn(
        `REFRESH REUSE DETECTED — userId=${record.userId} jti=${payload.jti} ` +
          `revokedAll=${revokedCount}`,
      );
      throw this.fail(ErrorCode.REFRESH_TOKEN_REUSE_DETECTED);
    }

    if (record.expiresAt.getTime() <= Date.now()) {
      throw this.fail(ErrorCode.REFRESH_TOKEN_EXPIRED);
    }

    const user = await this.prisma.user.findUnique({
      where: { id: record.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        deletedAt: true,
      },
    });

    if (!user || user.deletedAt) {
      throw this.fail(ErrorCode.REFRESH_TOKEN_INVALID);
    }

    const pair = await this.rotateTokenPair.execute(
      record.id,
      { id: user.id, email: user.email, role: user.role },
      context,
    );

    this.logger.log(
      `Refresh OK userId=${user.id} oldJti=${payload.jti} newRefreshId=${pair.refreshTokenId}`,
    );

    return {
      ...pair,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  private fail(code: ErrorCode): CustomHttpException {
    return new CustomHttpException(
      this.errorMessageService.getMessage(code),
      HttpStatus.UNAUTHORIZED,
      code,
    );
  }
}
