import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { isUUID } from 'class-validator';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { UserRole } from '@/generated/prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

import { GROUP_SCOPE_KEY } from '../constants/auth.constants';
import type { AuthenticatedUser } from '../interfaces/authenticated-user.interface';
import {
  groupScopeResolvers,
  type GroupResolver,
} from './group-scope.resolvers';
import { GroupScopeSubject } from './group-scope.subject';

/**
 * Segunda camada de autorização: **escopo por grupo**. Garante que o recurso
 * alvo (`request.params.id`) pertence ao mesmo `aerodromeGroupId` do usuário.
 *
 * Ordem na cadeia: `JwtAuthGuard → RolesGuard → GroupScopeGuard`.
 *
 * - Sem `@RequiresGroupScope` no handler → passa.
 * - `request.user` ausente → 401 (fallback caso o `JwtAuthGuard` falte).
 * - `user.role === ADMIN` → passa (bypass global, sem grupo).
 * - `params.id` ausente/não-UUID → 422 (não consulta o DB com lixo).
 * - Recurso inexistente ou soft-deletado → 404.
 * - `recurso.groupId !== user.aerodromeGroupId` → 403.
 *
 * O `aerodromeGroupId` do usuário é lido **do banco** (não do JWT), de modo que
 * uma troca de grupo tenha efeito imediato sem esperar o token expirar.
 */
@Injectable()
export class GroupScopeGuard implements CanActivate {
  private readonly logger = new Logger(GroupScopeGuard.name);
  private readonly resolvers: Record<GroupScopeSubject, GroupResolver> =
    groupScopeResolvers;

  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const subject = this.reflector.getAllAndOverride<
      GroupScopeSubject | undefined
    >(GROUP_SCOPE_KEY, [context.getHandler(), context.getClass()]);

    if (!subject) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{
      user?: AuthenticatedUser;
      params?: Record<string, string | undefined>;
    }>();
    const user = request.user;

    if (!user) {
      throw new CustomHttpException(
        this.errorMessageService.getMessage(ErrorCode.UNAUTHORIZED),
        HttpStatus.UNAUTHORIZED,
        ErrorCode.UNAUTHORIZED,
      );
    }

    if (user.role === UserRole.ADMIN) {
      return true;
    }

    const resourceId = request.params?.id;

    if (!resourceId || !isUUID(resourceId)) {
      throw new CustomHttpException(
        this.errorMessageService.getMessage(ErrorCode.VALIDATION_FAILED, {
          DETAILS: 'id deve ser um UUID válido',
        }),
        HttpStatus.UNPROCESSABLE_ENTITY,
        ErrorCode.VALIDATION_FAILED,
      );
    }

    const resolver = this.resolvers[subject];

    if (!resolver) {
      // Subject declarado no decorator mas sem resolver registrado — erro de
      // programação, não do cliente.
      this.logger.error(`No group resolver registered for subject=${subject}`);
      throw new CustomHttpException(
        this.errorMessageService.getMessage(ErrorCode.INTERNAL_ERROR),
        HttpStatus.INTERNAL_SERVER_ERROR,
        ErrorCode.INTERNAL_ERROR,
      );
    }

    const resourceGroupId = await resolver(this.prisma, resourceId);

    if (resourceGroupId === null) {
      throw new CustomHttpException(
        this.errorMessageService.getMessage(ErrorCode.RESOURCE_NOT_FOUND, {
          RESOURCE: subject,
          ID: resourceId,
        }),
        HttpStatus.NOT_FOUND,
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }

    // Lê o usuário ativo do banco (a JwtStrategy confia no payload e não
    // revalida contra o DB; um usuário soft-deletado com access token ainda
    // válido cai aqui como `null` → grupo `null` → 403).
    const dbUser = await this.prisma.user.findFirst({
      where: { id: user.id, deletedAt: null },
      select: { aerodromeGroupId: true },
    });
    const userGroupId = dbUser?.aerodromeGroupId ?? null;

    if (userGroupId === null || userGroupId !== resourceGroupId) {
      this.logger.debug(
        `Forbidden — userId=${user.id} userGroup=${userGroupId} ` +
          `resource=${subject}:${resourceId} resourceGroup=${resourceGroupId}`,
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
