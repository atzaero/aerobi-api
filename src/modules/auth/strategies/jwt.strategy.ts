import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';

import { JWT_TOKEN_TYPE } from '../constants/auth.constants';
import type { AuthenticatedUser } from '../interfaces/authenticated-user.interface';
import type { JwtPayload } from '../interfaces/jwt-payload.interface';

/**
 * Passport JWT Strategy (RS256).
 *
 * - Lê o **public key** de `JWT_SECRET_PUBLIC_KEY` no env (PEM em base64).
 * - Aceita apenas `typ === 'access'` — refresh é validado separadamente
 *   pelo `AuthRefreshSessionService` contra o DB.
 * - O retorno de `validate` é injetado em `request.user` pelo Passport;
 *   o `@CurrentUser()` decorator extrai esse valor.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    config: ConfigService,
    private readonly errorMessageService: ErrorMessageService,
  ) {
    const publicKeyBase64 = config.getOrThrow<string>('JWT_SECRET_PUBLIC_KEY');
    const publicKey = Buffer.from(publicKeyBase64, 'base64').toString('utf-8');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: publicKey,
      algorithms: ['RS256'],
    });
  }

  /**
   * Recebe o payload já decodificado e verificado (assinatura + expiração).
   * Aqui rejeitamos tokens cujo `typ` não é `access`.
   */
  validate(payload: JwtPayload): AuthenticatedUser {
    if (payload.typ !== JWT_TOKEN_TYPE.ACCESS) {
      this.logger.warn(`Rejecting non-access token typ=${payload.typ}`);
      throw new CustomHttpException(
        this.errorMessageService.getMessage(ErrorCode.INVALID_TOKEN),
        HttpStatus.UNAUTHORIZED,
        ErrorCode.INVALID_TOKEN,
      );
    }

    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
