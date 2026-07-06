import { Body, Controller, Param, Patch, Req, UseGuards } from '@nestjs/common';
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

import { UpdateMaintenanceDocs } from '../docs/update-maintenance.docs';
import { MaintenanceParamDTO } from '../dtos/maintenance-param.dto';
import { UpdateMaintenanceResponseDTO } from '../dtos/maintenance-response.dto';
import { UpdateMaintenanceDTO } from '../dtos/update-maintenance.dto';
import { UpdateMaintenanceService } from '../services/update-maintenance.service';

@ApiTags('Maintenances')
@Controller('maintenances')
@UseGuards(JwtAuthGuard, PermissionsGuard, GroupScopeGuard)
export class UpdateMaintenanceController {
  constructor(private readonly service: UpdateMaintenanceService) {}

  @Patch(':id')
  @RequirePermission('maintenance', 'update')
  @RequiresGroupScope(GroupScopeSubject.MAINTENANCE)
  @UpdateMaintenanceDocs()
  handle(
    @Param() { id }: MaintenanceParamDTO,
    @Body() dto: UpdateMaintenanceDTO,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: Request,
  ): Promise<UpdateMaintenanceResponseDTO> {
    return this.service.execute(
      id,
      dto,
      actor,
      buildAuditContext(actor, request),
    );
  }
}
