import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { RequirePermission } from '@/modules/auth/decorators/require-permission.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { GetDashboardDocs } from '../docs';
import type { DashboardResponseDTO } from '../dtos/dashboard-response.dto';
import { GetDashboardQueryDTO } from '../dtos/get-dashboard-query.dto';
import { GetDashboardService } from '../services/get-dashboard.service';

/**
 * `GET /dashboard` — agregação read-only por papel. JWT + `PermissionsGuard`
 * (`dashboard:read`); o recorte de dados por grupo é resolvido no service. Só
 * delega.
 */
@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class GetDashboardController {
  constructor(private readonly service: GetDashboardService) {}

  @Get()
  @RequirePermission('dashboard', 'read')
  @GetDashboardDocs()
  handle(
    @CurrentUser() actor: AuthenticatedUser,
    @Query() query: GetDashboardQueryDTO,
  ): Promise<DashboardResponseDTO> {
    return this.service.execute(actor, query);
  }
}
