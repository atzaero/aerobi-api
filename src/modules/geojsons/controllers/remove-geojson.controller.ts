import { Controller, Delete, Param, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import { buildAuditContext } from '@/modules/audit/utils/audit-context.util';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { RequirePermission } from '@/modules/auth/decorators/require-permission.decorator';
import { RequiresGroupScope } from '@/modules/auth/decorators/requires-group-scope.decorator';
import { GroupScopeGuard } from '@/modules/auth/guards/group-scope.guard';
import { GroupScopeSubject } from '@/modules/auth/guards/group-scope.subject';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { RemoveGeojsonDocs } from '../docs/remove-geojson.docs';
import { GeojsonParamDTO } from '../dtos/geojson-param.dto';
import { GeojsonResponseDTO } from '../dtos/geojson-response.dto';
import { RemoveGeojsonService } from '../services/remove-geojson.service';

@ApiTags('Geojsons')
@Controller('geojsons')
@UseGuards(JwtAuthGuard, PermissionsGuard, GroupScopeGuard)
export class RemoveGeojsonController {
  constructor(private readonly service: RemoveGeojsonService) {}

  @Delete(':id')
  @RequirePermission('aerodrome', 'delete')
  @RequiresGroupScope(GroupScopeSubject.GEOJSON)
  @RemoveGeojsonDocs()
  handle(
    @Param() { id }: GeojsonParamDTO,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: Request,
  ): Promise<GeojsonResponseDTO> {
    return this.service.execute(id, actor, buildAuditContext(actor, request));
  }
}
