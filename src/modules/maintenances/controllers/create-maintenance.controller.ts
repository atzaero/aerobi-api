import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import { buildAuditContext } from '@/modules/audit/utils/audit-context.util';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { RequirePermission } from '@/modules/auth/decorators/require-permission.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { CreateMaintenanceDocs } from '../docs/create-maintenance.docs';
import { CreateMaintenanceDTO } from '../dtos/create-maintenance.dto';
import { CreateMaintenanceResponseDTO } from '../dtos/maintenance-response.dto';
import { CreateMaintenanceService } from '../services/create-maintenance.service';

@ApiTags('Maintenances')
@Controller('maintenances')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CreateMaintenanceController {
  constructor(private readonly service: CreateMaintenanceService) {}

  @Post()
  @RequirePermission('maintenance', 'create')
  @CreateMaintenanceDocs()
  handle(
    @Body() dto: CreateMaintenanceDTO,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: Request,
  ): Promise<CreateMaintenanceResponseDTO> {
    return this.service.execute(dto, actor, buildAuditContext(actor, request));
  }
}
