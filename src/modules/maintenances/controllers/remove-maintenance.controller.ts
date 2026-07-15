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

import { RemoveMaintenanceDocs } from '../docs/remove-maintenance.docs';
import { MaintenanceDeletionResponseDTO } from '../dtos/maintenance-response.dto';
import { MaintenanceParamDTO } from '../dtos/maintenance-param.dto';
import { RemoveMaintenanceService } from '../services/remove-maintenance.service';

@ApiTags('Maintenances')
@Controller('maintenances')
@UseGuards(JwtAuthGuard, PermissionsGuard, GroupScopeGuard)
export class RemoveMaintenanceController {
  constructor(private readonly service: RemoveMaintenanceService) {}

  @Delete(':id')
  @RequirePermission('maintenance', 'delete')
  @RequiresGroupScope(GroupScopeSubject.MAINTENANCE)
  @RemoveMaintenanceDocs()
  handle(
    @Param() { id }: MaintenanceParamDTO,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: Request,
  ): Promise<MaintenanceDeletionResponseDTO> {
    return this.service.execute(id, actor, buildAuditContext(actor, request));
  }
}
