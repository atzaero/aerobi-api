import { randomUUID } from 'node:crypto';

import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';

import { JWT_TOKEN_TYPE } from '../constants/auth.constants';
import type { JwtSubject } from '../interfaces/auth-token.types';
import type { JwtPayload } from '../interfaces/jwt-payload.interface';

const DEFAULT_ACCESS_TTL = '15m';
const DEFAULT_REFRESH_TTL = '7d';

/** Resultado de uma assinatura — JWT + Date de expiração já calculada. */
export interface SignedToken {
  token: string;
  expiresAt: Date;
  jti: string;
}

/**
 * Posse exclusiva da **chave privada** JWT (RS256). Expõe a primitiva
 * de assinatura usada por `IssueTokenPairService` e
 * `RotateTokenPairService`. Não verifica tokens — isso é
 * `JwtVerifierService` (refresh) ou `JwtStrategy` (access).
 *
 * Decisões:
 * - **`jti` (randomUUID) por token** — garante hash SHA-256 distinto
 *   no DB mesmo se dois tokens fossem emitidos no mesmo segundo.
 * - **TTLs em formato `ms`** (`'15m'`, `'7d'`) — validados pelo
 *   `jsonwebtoken` em runtime; cast por causa do template literal
 *   estrito do `@nestjs/jwt` v11.
 */
@Injectable()
export class JwtSignerService {
  private readonly logger = new Logger(JwtSignerService.name);
  private readonly privateKey: string;
  private readonly accessTtl: string;
  private readonly refreshTtl: string;

  constructor(
    config: ConfigService,
    private readonly jwtService: JwtService,
    private readonly errorMessageService: ErrorMessageService,
  ) {
    this.privateKey = Buffer.from(
      config.getOrThrow<string>('JWT_SECRET_PRIVATE_KEY'),
      'base64',
    ).toString('utf-8');
    this.accessTtl = config.get<string>('JWT_ACCESS_TTL', DEFAULT_ACCESS_TTL);
    this.refreshTtl = config.get<string>(
      'JWT_REFRESH_TTL',
      DEFAULT_REFRESH_TTL,
    );
  }

  /** Assina um access token RS256 para o sujeito. */
  signAccess(subject: JwtSubject): SignedToken {
    return this.signWithType(subject, JWT_TOKEN_TYPE.ACCESS, this.accessTtl);
  }

  /** Assina um refresh token RS256 para o sujeito. */
  signRefresh(subject: JwtSubject): SignedToken {
    return this.signWithType(subject, JWT_TOKEN_TYPE.REFRESH, this.refreshTtl);
  }

  private signWithType(
    subject: JwtSubject,
    typ: JwtPayload['typ'],
    expiresIn: string,
  ): SignedToken {
    const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
      sub: subject.id,
      email: subject.email,
      role: subject.role,
      typ,
      jti: randomUUID(),
    };

    const token = this.jwtService.sign(payload, {
      privateKey: this.privateKey,
      algorithm: 'RS256',
      // O tipo `expiresIn` no `@nestjs/jwt` v11 herda o template literal
      // estrito do `ms`; o cast é seguro — `jsonwebtoken` aceita qualquer
      // formato `ms`-compatível em runtime.
      expiresIn: expiresIn as JwtSignOptions['expiresIn'],
    });

    const decoded: JwtPayload | null = this.jwtService.decode(token);
    if (!decoded?.exp) {
      this.logger.error(`Assinatura JWT sem claim exp inesperada — typ=${typ}`);
      throw new CustomHttpException(
        this.errorMessageService.getMessage(ErrorCode.INTERNAL_ERROR),
        HttpStatus.INTERNAL_SERVER_ERROR,
        ErrorCode.INTERNAL_ERROR,
      );
    }

    return {
      token,
      expiresAt: new Date(decoded.exp * 1000),
      jti: payload.jti,
    };
  }
}
