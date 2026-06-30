import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { RequirePermission } from '@/modules/auth/decorators/require-permission.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { CreateGroupDocs } from '../docs/create-group.docs';
import { GroupResponseDTO } from '../dtos/group-response.dto';
import { CreateGroupDTO } from '../dtos/create-group.dto';
import { CreateGroupService } from '../services/create-group.service';

@ApiTags('Groups')
@Controller('groups')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CreateGroupController {
  constructor(private readonly service: CreateGroupService) {}

  @Post()
  @RequirePermission('group', 'create')
  @CreateGroupDocs()
  handle(
    @Body() dto: CreateGroupDTO,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<GroupResponseDTO> {
    return this.service.execute(dto, actor);
  }
}
