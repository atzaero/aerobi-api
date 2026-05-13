import { Injectable, Logger } from '@nestjs/common';

import { RefreshTokenRepository } from '../repositories/refresh-token.repository';

import { JwtVerifierService } from './jwt-verifier.service';

/**
 * Caso de uso: revoga o refresh apresentado no logout.
 *
 * Idempotente: aceita refresh inválido/expirado/inexistente sem falhar
 * (o objetivo é desligar o cliente; o server-side response 204 sempre).
 * Apenas faz logging quando o refresh não bate.
 */
@Injectable()
export class AuthLogoutService {
  private readonly logger = new Logger(AuthLogoutService.name);

  constructor(
    private readonly jwtVerifier: JwtVerifierService,

    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async execute(refreshToken: string): Promise<void> {
    let jti: string;

    try {
      const payload = this.jwtVerifier.verifyRefreshToken(refreshToken);
      jti = payload.jti;
    } catch {
      this.logger.debug('Logout chamado com refresh inválido — ignorando');
      return;
    }

    const record = await this.refreshTokenRepository.findByJti(jti);
    if (!record || record.revoked || record.deletedAt) {
      this.logger.debug(
        `Logout — refresh já revogado ou inexistente jti=${jti}`,
      );
      return;
    }

    await this.refreshTokenRepository.revokeById(record.id);
    this.logger.log(`Logout OK userId=${record.userId} jti=${jti}`);
  }
}
