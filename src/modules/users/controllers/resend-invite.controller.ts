import { Controller, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { Roles } from '@/modules/auth/decorators/roles.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import { UserRole } from '@/generated/prisma/client';

import { ResendInviteDocs } from '../docs/resend-invite.docs';
import { UserIdParamDto } from '../dtos/user-id-param.dto';
import { UserResponseDto } from '../dtos/user-response.dto';
import { ResendInviteService } from '../services/resend-invite.service';

@ApiTags('Invites')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ResendInviteController {
  constructor(private readonly service: ResendInviteService) {}

  @ResendInviteDocs()
  @Roles(UserRole.ADMIN)
  handle(
    @Param() { id }: UserIdParamDto,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<UserResponseDto> {
    return this.service.execute({ userId: id, actorId: actor.id });
  }
}
