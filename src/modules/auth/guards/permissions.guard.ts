import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';

import { PERMISSION_KEY } from '../constants/auth.constants';
import type { RequiredPermission } from '../decorators/require-permission.decorator';
import type { AuthenticatedUser } from '../interfaces/authenticated-user.interface';
import { can } from '../permissions';

/**
 * Guard que decide a autorização do usuário autenticado contra a matriz
 * `PERMISSIONS` (`can(role, subject, action)`). Deve sempre vir **depois** do
 * `JwtAuthGuard` (que popula `request.user`).
 *
 * - Sem `@RequirePermission` na rota → passa (esta rota é livre quanto a este
 *   guard; convive com `RolesGuard`/`AerobiApiKeyGuard`).
 * - `request.user` ausente → 401 (fallback caso o `JwtAuthGuard` tenha sido
 *   esquecido).
 * - `can(...)` nega → 403 (`FORBIDDEN`).
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  private readonly logger = new Logger(PermissionsGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const permission = this.reflector.getAllAndOverride<RequiredPermission>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!permission) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<{ user?: AuthenticatedUser }>();
    const user = request.user;

    if (!user) {
      throw new CustomHttpException(
        this.errorMessageService.getMessage(ErrorCode.UNAUTHORIZED),
        HttpStatus.UNAUTHORIZED,
        ErrorCode.UNAUTHORIZED,
      );
    }

    const { subject, action } = permission;

    if (!can(user.role, subject, action)) {
      this.logger.debug(
        `Forbidden — userId=${user.id} role=${user.role} ` +
          `subject=${subject} action=${action}`,
      );
      throw new CustomHttpException(
        this.errorMessageService.getMessage(ErrorCode.FORBIDDEN, {
          RESOURCE: subject,
        }),
        HttpStatus.FORBIDDEN,
        ErrorCode.FORBIDDEN,
      );
    }

    return true;
  }
}
