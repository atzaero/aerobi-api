import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';

import { JWT_TOKEN_TYPE } from '../constants/auth.constants';
import type { JwtPayload } from '../interfaces/jwt-payload.interface';

/**
 * Posse exclusiva da **chave pública** JWT (RS256). Verifica refresh
 * tokens — access tokens são verificados pela `JwtStrategy` Passport
 * (mesmo segredo, fluxo Passport-bound).
 *
 * Tradução dos erros do `jsonwebtoken` para `ErrorCode`:
 * - `TokenExpiredError` → `REFRESH_TOKEN_EXPIRED`
 * - resto (signature, malformed) → `REFRESH_TOKEN_INVALID`
 * - typ ≠ 'refresh' → `REFRESH_TOKEN_INVALID`
 */
@Injectable()
export class JwtVerifierService {
  private readonly logger = new Logger(JwtVerifierService.name);
  private readonly publicKey: string;

  constructor(
    config: ConfigService,
    private readonly jwtService: JwtService,
    private readonly errorMessageService: ErrorMessageService,
  ) {
    this.publicKey = Buffer.from(
      config.getOrThrow<string>('JWT_SECRET_PUBLIC_KEY'),
      'base64',
    ).toString('utf-8');
  }

  verifyRefreshToken(plain: string): JwtPayload {
    let payload: JwtPayload;

    try {
      payload = this.jwtService.verify<JwtPayload>(plain, {
        publicKey: this.publicKey,
        algorithms: ['RS256'],
      });
    } catch (err) {
      const isExpired =
        err instanceof Error && err.name === 'TokenExpiredError';
      const code = isExpired
        ? ErrorCode.REFRESH_TOKEN_EXPIRED
        : ErrorCode.REFRESH_TOKEN_INVALID;
      this.logger.debug(
        `Refresh JWT verify failed name=${
          err instanceof Error ? err.name : 'unknown'
        } code=${code}`,
      );
      throw new CustomHttpException(
        this.errorMessageService.getMessage(code),
        HttpStatus.UNAUTHORIZED,
        code,
      );
    }

    if (payload.typ !== JWT_TOKEN_TYPE.REFRESH) {
      this.logger.warn(
        `Token com typ errado apresentado como refresh typ=${payload.typ}`,
      );
      throw new CustomHttpException(
        this.errorMessageService.getMessage(ErrorCode.REFRESH_TOKEN_INVALID),
        HttpStatus.UNAUTHORIZED,
        ErrorCode.REFRESH_TOKEN_INVALID,
      );
    }

    return payload;
  }
}
