import { Body, Controller, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import { buildAuditContext } from '@/modules/audit/utils/audit-context.util';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { RequirePermission } from '@/modules/auth/decorators/require-permission.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { UpdateGroupDocs } from '../docs/update-group.docs';
import { GroupParamDTO } from '../dtos/group-param.dto';
import { GroupResponseDTO } from '../dtos/group-response.dto';
import { UpdateGroupDTO } from '../dtos/update-group.dto';
import { UpdateGroupService } from '../services/update-group.service';

@ApiTags('Groups')
@Controller('groups')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UpdateGroupController {
  constructor(private readonly service: UpdateGroupService) {}

  @Patch(':id')
  @RequirePermission('group', 'update')
  @UpdateGroupDocs()
  handle(
    @Param() { id }: GroupParamDTO,
    @Body() dto: UpdateGroupDTO,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: Request,
  ): Promise<GroupResponseDTO> {
    return this.service.execute(
      id,
      dto,
      actor,
      buildAuditContext(actor, request),
    );
  }
}
