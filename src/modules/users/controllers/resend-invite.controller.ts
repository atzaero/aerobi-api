import { Controller, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { RequirePermission } from '@/modules/auth/decorators/require-permission.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { ResendInviteDocs } from '../docs/resend-invite.docs';
import { UserIdParamDto } from '../dtos/user-id-param.dto';
import { UserResponseDto } from '../dtos/user-response.dto';
import { ResendInviteService } from '../services/resend-invite.service';

@ApiTags('Invites')
@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ResendInviteController {
  constructor(private readonly service: ResendInviteService) {}

  @ResendInviteDocs()
  @RequirePermission('user', 'create')
  handle(
    @Param() { id }: UserIdParamDto,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<UserResponseDto> {
    return this.service.execute({
      userId: id,
      actorId: actor.id,
      actorRole: actor.role,
    });
  }
}
