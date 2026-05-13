import { createHash, randomUUID } from 'node:crypto';

import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import type { UserRole } from '@/generated/prisma/client';

import { JWT_TOKEN_TYPE } from '../constants/auth.constants';
import type { JwtPayload } from '../interfaces/jwt-payload.interface';
import {
  REFRESH_TOKEN_REPOSITORY,
  type IRefreshTokenRepository,
} from '../repositories/refresh-token.repository.interface';

export interface IssuedTokenPair {
  accessToken: string;
  accessExpiresAt: Date;
  refreshToken: string;
  refreshExpiresAt: Date;
  refreshTokenId: string;
}

export interface SessionContext {
  userAgent?: string;
  ipAddress?: string;
}

export interface JwtSubject {
  id: string;
  email: string;
  role: UserRole;
}

const DEFAULT_ACCESS_TTL = '15m';
const DEFAULT_REFRESH_TTL = '7d';

/**
 * Núcleo do auth: assina e verifica JWTs (RS256), persiste hashes
 * SHA-256 dos refresh emitidos, e expõe primitivos de emissão/rotação
 * usados pelos services de login/refresh.
 *
 * Decisões:
 * - **JWT_PRIVATE_KEY** (PEM base64) é usada só aqui para assinar; a
 *   verificação roda também aqui (refresh) ou na `JwtStrategy` (access).
 * - **SHA-256** do JWT plain é o que vai ao DB (`token_hash`). O lookup
 *   é por `jti` único; o hash serve só como defesa em profundidade
 *   (se DB vazar sem a private key, ainda assim hashes são inúteis).
 * - **`jti` próprio (randomUUID)** garante hash distinto mesmo se dois
 *   tokens fossem assinados no mesmo segundo com mesmos claims.
 */
@Injectable()
export class AuthTokenService {
  private readonly logger = new Logger(AuthTokenService.name);
  private readonly privateKey: string;
  private readonly publicKey: string;
  private readonly accessTtl: string;
  private readonly refreshTtl: string;

  constructor(
    config: ConfigService,
    private readonly jwtService: JwtService,
    private readonly errorMessageService: ErrorMessageService,
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: IRefreshTokenRepository,
  ) {
    this.privateKey = Buffer.from(
      config.getOrThrow<string>('JWT_SECRET_PRIVATE_KEY'),
      'base64',
    ).toString('utf-8');
    this.publicKey = Buffer.from(
      config.getOrThrow<string>('JWT_SECRET_PUBLIC_KEY'),
      'base64',
    ).toString('utf-8');
    this.accessTtl = config.get<string>('JWT_ACCESS_TTL', DEFAULT_ACCESS_TTL);
    this.refreshTtl = config.get<string>(
      'JWT_REFRESH_TTL',
      DEFAULT_REFRESH_TTL,
    );
  }

  /**
   * Emite um par fresco (access + refresh) e persiste o refresh no DB
   * (não rotaciona — usado pelo login e por aceite de convite).
   */
  async issuePair(
    subject: JwtSubject,
    context?: SessionContext,
  ): Promise<IssuedTokenPair> {
    const accessPayload = this.buildPayload(subject, JWT_TOKEN_TYPE.ACCESS);
    const refreshPayload = this.buildPayload(subject, JWT_TOKEN_TYPE.REFRESH);

    const accessToken = this.signRs256(accessPayload, this.accessTtl);
    const refreshToken = this.signRs256(refreshPayload, this.refreshTtl);

    const refreshDecoded = this.decodeNoVerify(refreshToken);
    const accessDecoded = this.decodeNoVerify(accessToken);

    const refreshExpiresAt = new Date(refreshDecoded.exp! * 1000);
    const accessExpiresAt = new Date(accessDecoded.exp! * 1000);

    const created = await this.refreshTokenRepository.create({
      jti: refreshPayload.jti,
      tokenHash: this.hashRefresh(refreshToken),
      userId: subject.id,
      expiresAt: refreshExpiresAt,
      ...(context?.userAgent !== undefined && { userAgent: context.userAgent }),
      ...(context?.ipAddress !== undefined && { ipAddress: context.ipAddress }),
    });

    return {
      accessToken,
      accessExpiresAt,
      refreshToken,
      refreshExpiresAt,
      refreshTokenId: created.id,
    };
  }

  /**
   * Rotaciona um refresh existente: emite par novo e marca o anterior
   * como revogado + `replaced_by_id`. Operação atômica (transação no
   * repository).
   */
  async rotatePair(
    currentRefreshTokenId: string,
    subject: JwtSubject,
    context?: SessionContext,
  ): Promise<IssuedTokenPair> {
    const accessPayload = this.buildPayload(subject, JWT_TOKEN_TYPE.ACCESS);
    const refreshPayload = this.buildPayload(subject, JWT_TOKEN_TYPE.REFRESH);

    const accessToken = this.signRs256(accessPayload, this.accessTtl);
    const refreshToken = this.signRs256(refreshPayload, this.refreshTtl);

    const refreshDecoded = this.decodeNoVerify(refreshToken);
    const accessDecoded = this.decodeNoVerify(accessToken);
    const refreshExpiresAt = new Date(refreshDecoded.exp! * 1000);
    const accessExpiresAt = new Date(accessDecoded.exp! * 1000);

    const created = await this.refreshTokenRepository.rotate({
      currentId: currentRefreshTokenId,
      newToken: {
        jti: refreshPayload.jti,
        tokenHash: this.hashRefresh(refreshToken),
        userId: subject.id,
        expiresAt: refreshExpiresAt,
        ...(context?.userAgent !== undefined && {
          userAgent: context.userAgent,
        }),
        ...(context?.ipAddress !== undefined && {
          ipAddress: context.ipAddress,
        }),
      },
    });

    return {
      accessToken,
      accessExpiresAt,
      refreshToken,
      refreshExpiresAt,
      refreshTokenId: created.id,
    };
  }

  /**
   * Verifica assinatura RS256 + expiração do refresh JWT.
   * Lança `CustomHttpException` em caso de assinatura inválida ou expirado.
   */
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
        `Token with wrong typ used as refresh typ=${payload.typ}`,
      );
      throw new CustomHttpException(
        this.errorMessageService.getMessage(ErrorCode.REFRESH_TOKEN_INVALID),
        HttpStatus.UNAUTHORIZED,
        ErrorCode.REFRESH_TOKEN_INVALID,
      );
    }

    return payload;
  }

  /** SHA-256 hex do JWT plain — formato armazenado em `refresh_tokens.token_hash`. */
  hashRefresh(plain: string): string {
    return createHash('sha256').update(plain).digest('hex');
  }

  private buildPayload(
    subject: JwtSubject,
    typ: JwtPayload['typ'],
  ): Omit<JwtPayload, 'iat' | 'exp'> {
    return {
      sub: subject.id,
      email: subject.email,
      role: subject.role,
      typ,
      jti: randomUUID(),
    };
  }

  private signRs256(
    payload: Omit<JwtPayload, 'iat' | 'exp'>,
    expiresIn: string,
  ): string {
    return this.jwtService.sign(payload, {
      privateKey: this.privateKey,
      algorithm: 'RS256',
      // O tipo `expiresIn` em `@nestjs/jwt` v11 herda o template literal
      // estrito do `ms` (`'15m' | '1h' | '7d' | ...`), incompatível com
      // `string` dinâmico vindo de env. O cast é seguro: `jsonwebtoken`
      // aceita qualquer formato `ms`-compatível em runtime.
      expiresIn: expiresIn as JwtSignOptions['expiresIn'],
    });
  }

  private decodeNoVerify(token: string): JwtPayload {
    const decoded: JwtPayload | null = this.jwtService.decode(token);
    if (!decoded || !decoded.exp) {
      // Não deveria acontecer logo após `sign`, mas garante invariância
      // antes de calcular `expiresAt`.
      throw new CustomHttpException(
        this.errorMessageService.getMessage(ErrorCode.INTERNAL_ERROR),
        HttpStatus.INTERNAL_SERVER_ERROR,
        ErrorCode.INTERNAL_ERROR,
      );
    }
    return decoded;
  }
}
