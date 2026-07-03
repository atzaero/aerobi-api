import { Controller, Param, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import { buildAuditContext } from '@/modules/audit/utils/audit-context.util';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { RequirePermission } from '@/modules/auth/decorators/require-permission.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { AdminResetPasswordDocs } from '../docs/admin-reset-password.docs';
import { PasswordResetResponseDto } from '../dtos/password-reset-response.dto';
import { UserIdParamDto } from '../dtos/user-id-param.dto';
import { AdminResetPasswordService } from '../services/admin-reset-password.service';

/**
 * Reset de senha por administrador (`POST /users/:id/password-reset`). Gated por
 * `@RequirePermission('user','update')` (ADMIN). Dispara um link de redefinição.
 */
@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AdminResetPasswordController {
  constructor(private readonly service: AdminResetPasswordService) {}

  @AdminResetPasswordDocs()
  @RequirePermission('user', 'update')
  handle(
    @Param() { id }: UserIdParamDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: Request,
  ): Promise<PasswordResetResponseDto> {
    return this.service.execute(id, actor, buildAuditContext(actor, request));
  }
}
