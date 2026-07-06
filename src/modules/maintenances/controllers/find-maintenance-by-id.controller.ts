import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { RequirePermission } from '@/modules/auth/decorators/require-permission.decorator';
import { RequiresGroupScope } from '@/modules/auth/decorators/requires-group-scope.decorator';
import { GroupScopeGuard } from '@/modules/auth/guards/group-scope.guard';
import { GroupScopeSubject } from '@/modules/auth/guards/group-scope.subject';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';

import { FindMaintenanceByIdDocs } from '../docs/find-maintenance-by-id.docs';
import { MaintenanceParamDTO } from '../dtos/maintenance-param.dto';
import { MaintenanceResponseDTO } from '../dtos/maintenance-response.dto';
import { FindMaintenanceByIdService } from '../services/find-maintenance-by-id.service';

@ApiTags('Maintenances')
@Controller('maintenances')
@UseGuards(JwtAuthGuard, PermissionsGuard, GroupScopeGuard)
export class FindMaintenanceByIdController {
  constructor(private readonly service: FindMaintenanceByIdService) {}

  @Get(':id')
  @RequirePermission('maintenance', 'read')
  @RequiresGroupScope(GroupScopeSubject.MAINTENANCE)
  @FindMaintenanceByIdDocs()
  handle(
    @Param() { id }: MaintenanceParamDTO,
  ): Promise<MaintenanceResponseDTO> {
    return this.service.execute(id);
  }
}
