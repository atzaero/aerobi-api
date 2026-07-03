import { Body, Controller, Param, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import { buildAuditContext } from '@/modules/audit/utils/audit-context.util';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { RequirePermission } from '@/modules/auth/decorators/require-permission.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { UpdateUserDocs } from '../docs/update-user.docs';
import { AdminUpdateUserRequestDto } from '../dtos/admin-update-user-request.dto';
import { UserIdParamDto } from '../dtos/user-id-param.dto';
import { UserResponseDto } from '../dtos/user-response.dto';
import { UpdateUserService } from '../services/update-user.service';

/**
 * Edição administrativa de usuário (`PATCH /users/:id`). Gated por
 * `@RequirePermission('user','edit')` (ADMIN/COORDINATOR); o escopo por grupo e
 * o recorte de role-alvo são aplicados no service. Auto-edição de perfil fica em
 * `PATCH /users/me` (`UpdateProfileController`).
 */
@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UpdateUserController {
  constructor(private readonly service: UpdateUserService) {}

  @UpdateUserDocs()
  @RequirePermission('user', 'edit')
  handle(
    @Param() { id }: UserIdParamDto,
    @Body() dto: AdminUpdateUserRequestDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: Request,
  ): Promise<UserResponseDto> {
    return this.service.execute(
      id,
      dto,
      actor,
      buildAuditContext(actor, request),
    );
  }
}
