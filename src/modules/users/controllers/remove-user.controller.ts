import { Controller, Param, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import { buildAuditContext } from '@/modules/audit/utils/audit-context.util';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { RequirePermission } from '@/modules/auth/decorators/require-permission.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { RemoveUserDocs } from '../docs/remove-user.docs';
import { UserIdParamDto } from '../dtos/user-id-param.dto';
import { RemoveUserService } from '../services/remove-user.service';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RemoveUserController {
  constructor(private readonly service: RemoveUserService) {}

  @RemoveUserDocs()
  @RequirePermission('user', 'delete')
  handle(
    @Param() { id }: UserIdParamDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: Request,
  ): Promise<void> {
    return this.service.execute(id, actor, buildAuditContext(actor, request));
  }
}
