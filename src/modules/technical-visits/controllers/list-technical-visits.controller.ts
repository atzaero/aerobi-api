import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { RequirePermission } from '@/modules/auth/decorators/require-permission.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { ListTechnicalVisitsDocs } from '../docs/list-technical-visits.docs';
import { ListTechnicalVisitsQueryDTO } from '../dtos/list-technical-visits-query.dto';
import { TechnicalVisitsPaginatedResponseDTO } from '../dtos/technical-visits-paginated-response.dto';
import { ListTechnicalVisitsService } from '../services/list-technical-visits.service';

@ApiTags('Technical Visits')
@Controller('technical-visits')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ListTechnicalVisitsController {
  constructor(private readonly service: ListTechnicalVisitsService) {}

  @Get()
  @RequirePermission('technical_visit', 'list')
  @ListTechnicalVisitsDocs()
  handle(
    @Query() query: ListTechnicalVisitsQueryDTO,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<TechnicalVisitsPaginatedResponseDTO> {
    return this.service.execute(query, actor);
  }
}
