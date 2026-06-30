import { Controller, Delete, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { RequirePermission } from '@/modules/auth/decorators/require-permission.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { RemoveGroupDocs } from '../docs/remove-group.docs';
import { GroupDeletionResponseDTO } from '../dtos/group-deletion-response.dto';
import { GroupParamDTO } from '../dtos/group-param.dto';
import { RemoveGroupService } from '../services/remove-group.service';

@ApiTags('Groups')
@Controller('groups')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RemoveGroupController {
  constructor(private readonly service: RemoveGroupService) {}

  @Delete(':id')
  @RequirePermission('group', 'delete')
  @RemoveGroupDocs()
  handle(
    @Param() { id }: GroupParamDTO,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<GroupDeletionResponseDTO> {
    return this.service.execute(id, actor);
  }
}
