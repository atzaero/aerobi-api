import { Controller, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { Roles } from '@/modules/auth/decorators/roles.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import { UserRole } from '@/generated/prisma/client';

import { RemoveUserDocs } from '../docs/remove-user.docs';
import { UserIdParamDto } from '../dtos/user-id-param.dto';
import { RemoveUserService } from '../services/remove-user.service';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RemoveUserController {
  constructor(private readonly service: RemoveUserService) {}

  @RemoveUserDocs()
  @Roles(UserRole.ADMIN)
  handle(
    @Param() { id }: UserIdParamDto,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<void> {
    return this.service.execute(id, actor.id);
  }
}
