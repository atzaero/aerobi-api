import {
  ExecutionContext,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';

import { IS_PUBLIC_KEY } from '../constants/auth.constants';
import type { AuthenticatedUser } from '../interfaces/authenticated-user.interface';

/**
 * Guard que aplica a `JwtStrategy` Passport-based.
 *
 * - Respeita o decorator `@Public()` (metadata `IS_PUBLIC_KEY`) — útil
 *   quando o guard estiver registrado globalmente (`APP_GUARD`) e algumas
 *   rotas precisarem ignorar JWT (ex: login, refresh, health).
 * - `handleRequest` é sobrescrito para emitir `CustomHttpException` com
 *   `ErrorCode.UNAUTHORIZED` em vez do erro genérico do Passport.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly errorMessageService: ErrorMessageService,
  ) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest<TUser extends AuthenticatedUser>(
    err: unknown,
    user: TUser | false,
    info: unknown,
  ): TUser {
    if (err || !user) {
      this.logger.debug(
        `JWT auth failed err=${describe(err)} info=${describe(info)}`,
      );
      throw new CustomHttpException(
        this.errorMessageService.getMessage(ErrorCode.UNAUTHORIZED),
        HttpStatus.UNAUTHORIZED,
        ErrorCode.UNAUTHORIZED,
      );
    }

    return user;
  }
}

function describe(value: unknown): string {
  if (value === null || value === undefined) return 'none';
  if (value instanceof Error) return `${value.name}: ${value.message}`;
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  try {
    return JSON.stringify(value);
  } catch {
    return '[unserializable]';
  }
}
