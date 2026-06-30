import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { RequirePermission } from '@/modules/auth/decorators/require-permission.decorator';
import { RequiresGroupScope } from '@/modules/auth/decorators/requires-group-scope.decorator';
import { GroupScopeGuard } from '@/modules/auth/guards/group-scope.guard';
import { GroupScopeSubject } from '@/modules/auth/guards/group-scope.subject';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';

import { FindGroupByIdDocs } from '../docs/find-group-by-id.docs';
import { GroupParamDTO } from '../dtos/group-param.dto';
import { GroupResponseDTO } from '../dtos/group-response.dto';
import { FindGroupByIdService } from '../services/find-group-by-id.service';

@ApiTags('Groups')
@Controller('groups')
@UseGuards(JwtAuthGuard, PermissionsGuard, GroupScopeGuard)
export class FindGroupByIdController {
  constructor(private readonly service: FindGroupByIdService) {}

  @Get(':id')
  @RequirePermission('group', 'read')
  @RequiresGroupScope(GroupScopeSubject.GROUP)
  @FindGroupByIdDocs()
  handle(@Param() { id }: GroupParamDTO): Promise<GroupResponseDTO> {
    return this.service.execute(id);
  }
}
