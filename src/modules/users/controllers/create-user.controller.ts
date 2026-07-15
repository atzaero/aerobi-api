import { Body, Controller, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import { buildAuditContext } from '@/modules/audit/utils/audit-context.util';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { RequirePermission } from '@/modules/auth/decorators/require-permission.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { CreateUserDocs } from '../docs/create-user.docs';
import { CreateUserRequestDto } from '../dtos/create-user-request.dto';
import { UserResponseDto } from '../dtos/user-response.dto';
import { CreateUserService } from '../services/create-user.service';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CreateUserController {
  constructor(private readonly service: CreateUserService) {}

  @CreateUserDocs()
  @RequirePermission('user', 'create')
  handle(
    @Body() dto: CreateUserRequestDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: Request,
  ): Promise<UserResponseDto> {
    return this.service.execute(
      {
        ...dto,
        actorId: actor.id,
        actorRole: actor.role,
      },
      buildAuditContext(actor, request),
    );
  }
}
