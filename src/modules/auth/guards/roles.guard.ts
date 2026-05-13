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
import type { UserRole } from '@/generated/prisma/client';

import { ROLES_KEY } from '../constants/auth.constants';
import type { AuthenticatedUser } from '../interfaces/authenticated-user.interface';

/**
 * Guard que confere a role do usuário autenticado contra a lista declarada
 * em `@Roles(...)`. Deve sempre vir **depois** do `JwtAuthGuard` (que
 * popula `request.user`).
 *
 * - Sem `@Roles` na rota → passa (qualquer usuário autenticado).
 * - `request.user` ausente → 401 (fallback caso JwtAuthGuard tenha sido
 *   esquecido).
 * - Role do usuário não está na lista → 403 com `ROLE_CHANGE_FORBIDDEN`
 *   substituído por `FORBIDDEN` (o primeiro é específico para mutações
 *   de role).
 */
@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
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

    if (!requiredRoles.includes(user.role)) {
      this.logger.debug(
        `Forbidden — userId=${user.id} role=${user.role} ` +
          `required=${requiredRoles.join(',')}`,
      );
      throw new CustomHttpException(
        this.errorMessageService.getMessage(ErrorCode.FORBIDDEN, {
          RESOURCE: 'rota',
        }),
        HttpStatus.FORBIDDEN,
        ErrorCode.FORBIDDEN,
      );
    }

    return true;
  }
}
