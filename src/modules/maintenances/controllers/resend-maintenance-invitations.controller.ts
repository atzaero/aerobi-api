import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { RequirePermission } from '@/modules/auth/decorators/require-permission.decorator';
import { RequiresGroupScope } from '@/modules/auth/decorators/requires-group-scope.decorator';
import { GroupScopeGuard } from '@/modules/auth/guards/group-scope.guard';
import { GroupScopeSubject } from '@/modules/auth/guards/group-scope.subject';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';

import { MaintenanceParamDTO } from '../dtos/maintenance-param.dto';
import {
  ResendMaintenanceInvitationsDTO,
  ResendMaintenanceInvitationsResponseDTO,
} from '../dtos/resend-maintenance-invitations.dto';
import { ResendMaintenanceInvitationsDocs } from '../docs/resend-maintenance-invitations.docs';
import { ResendMaintenanceInvitationsService } from '../services/resend-maintenance-invitations.service';

@ApiTags('Maintenances')
@Controller('maintenances')
@UseGuards(JwtAuthGuard, PermissionsGuard, GroupScopeGuard)
export class ResendMaintenanceInvitationsController {
  constructor(private readonly service: ResendMaintenanceInvitationsService) {}

  @Post(':id/resend-invitations')
  @RequirePermission('maintenance', 'update')
  @RequiresGroupScope(GroupScopeSubject.MAINTENANCE)
  @ResendMaintenanceInvitationsDocs()
  handle(
    @Param() { id }: MaintenanceParamDTO,
    @Body() dto: ResendMaintenanceInvitationsDTO,
  ): Promise<ResendMaintenanceInvitationsResponseDTO> {
    return this.service.execute(id, dto);
  }
}
